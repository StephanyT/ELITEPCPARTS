import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

// Direcciones del ambiente de pruebas (sandbox) de Niubiz.
// En producción se cambian por las de producción con las variables NIUBIZ_*_URL.
const SANDBOX = {
  security: 'https://apisandbox.vnforappstest.com/api.security/v1/security',
  session: 'https://apisandbox.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session/',
  authorization: 'https://apisandbox.vnforappstest.com/api.authorization/v3/authorization/ecommerce/',
  checkoutJs: 'https://static-content-qas.vnforapps.com/env/sandbox/js/checkout.js',
};

export interface ResultadoAutorizacion {
  aprobado: boolean;
  actionCode: string | null;
  mensaje: string | null;
  codigoAutorizacion: string | null;
  tarjeta: string | null;
  marca: string | null;
}

// Habla con la API de Niubiz. Las credenciales viven solo aquí, en el servidor:
// antes estaban en checkout.js y cualquiera podía verlas con F12.
@Injectable()
export class NiubizClient {
  private readonly logger = new Logger(NiubizClient.name);

  get merchantId() {
    return process.env.NIUBIZ_MERCHANT_ID ?? '';
  }

  get checkoutJsUrl() {
    return process.env.NIUBIZ_CHECKOUT_JS_URL ?? SANDBOX.checkoutJs;
  }

  private credenciales() {
    const user = process.env.NIUBIZ_USER;
    const password = process.env.NIUBIZ_PASSWORD;
    if (!this.merchantId || !user || !password) {
      throw new ServiceUnavailableException('El pago no está configurado (faltan las variables NIUBIZ_*)');
    }
    return { user, password };
  }

  // Paso 1: token de seguridad (dura unos minutos; se pide uno por operación)
  async tokenDeSeguridad(): Promise<string> {
    const { user, password } = this.credenciales();
    const res = await fetch(process.env.NIUBIZ_SECURITY_URL ?? SANDBOX.security, {
      method: 'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'), Accept: '*/*' },
    });
    if (!res.ok) {
      this.logger.error(`Niubiz security respondió ${res.status}`);
      throw new ServiceUnavailableException('No se pudo conectar con Niubiz');
    }
    return (await res.text()).trim();
  }

  // Paso 2: sesión de pago con el monto. El navegador la usa para abrir el formulario de Niubiz.
  async crearSesion(token: string, datos: { monto: number; email: string; usuarioId: number; clientIp: string }) {
    const res = await fetch(`${process.env.NIUBIZ_SESSION_URL ?? SANDBOX.session}${this.merchantId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({
        amount: datos.monto,
        channel: 'web',
        antifraud: {
          clientIp: datos.clientIp,
          merchantDefineData: {
            MDD4: datos.email,
            MDD21: 1,
            MDD32: String(datos.usuarioId),
            MDD75: 'Registrado',
            MDD77: 1,
          },
        },
      }),
    });
    if (!res.ok) {
      this.logger.error(`Niubiz session respondió ${res.status}: ${await res.text().catch(() => '')}`);
      throw new ServiceUnavailableException('No se pudo crear la sesión de pago');
    }
    const data = (await res.json()) as { sessionKey?: string };
    if (!data.sessionKey) throw new ServiceUnavailableException('Niubiz no devolvió la sesión de pago');
    return data.sessionKey;
  }

  // Paso 3: autorizar (cobrar) con el transactionToken que Niubiz le dio al navegador.
  // Esta es la confirmación de verdad: el resultado viene de Niubiz, no de la URL.
  async autorizar(
    token: string,
    datos: { transactionToken: string; purchaseNumber: string; monto: number },
  ): Promise<ResultadoAutorizacion> {
    const res = await fetch(`${process.env.NIUBIZ_AUTHORIZATION_URL ?? SANDBOX.authorization}${this.merchantId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({
        channel: 'web',
        captureType: 'manual',
        countable: true,
        order: {
          tokenId: datos.transactionToken,
          purchaseNumber: datos.purchaseNumber,
          amount: datos.monto,
          currency: 'PEN',
        },
      }),
    });

    // Aprobado: 200 con "dataMap". Rechazado: 400 con "data". Los dos traen ACTION_CODE.
    const body = (await res.json().catch(() => ({}))) as any;
    const mapa = body.dataMap ?? body.data ?? {};
    const actionCode: string | null = mapa.ACTION_CODE ?? body.order?.actionCode ?? null;

    return {
      aprobado: res.ok && actionCode === '000',
      actionCode,
      mensaje: mapa.ACTION_DESCRIPTION ?? body.errorMessage ?? null,
      codigoAutorizacion: mapa.AUTHORIZATION_CODE ?? body.order?.authorizationCode ?? null,
      tarjeta: mapa.CARD ?? null,
      marca: mapa.BRAND ?? null,
    };
  }
}