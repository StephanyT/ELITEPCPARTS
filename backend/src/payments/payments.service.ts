import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { NiubizClient } from './niubiz.client';
import { OrdersService, formatoPedido } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/order.dto';
import { Usuario } from '../usuarios/usuario.entity';
import type { UsuarioToken } from '../auth/auth.decorators';

// Número de compra para Niubiz: solo dígitos y máximo 12.
// Se arma con la hora en milisegundos (13 dígitos) quitando el primero.
export const nuevoPurchaseNumber = () => String(Date.now()).slice(-12);

// Niubiz pide una IPv4 para su antifraude; si llega ::1 o una IPv6, se usa la local.
export const ipv4 = (ip?: string) => {
  const limpia = (ip ?? '').replace(/^::ffff:/, '');
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(limpia) ? limpia : '127.0.0.1';
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,
    @InjectRepository(Usuario)
    private usuariosRepo: Repository<Usuario>,
    private ordersService: OrdersService,
    private niubiz: NiubizClient,
  ) {}

  // 1) El cliente quiere pagar: se calcula el monto en el servidor y se abre una sesión en Niubiz
  async crearSesion(usuarioToken: UsuarioToken, dto: CreateOrderDto, ip?: string) {
    const usuario = await this.usuariosRepo.findOneBy({ id: usuarioToken.id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Mismo cálculo que el pedido: precios de la base + envío
    const { total } = await this.ordersService.cotizar(dto.items);

    const token = await this.niubiz.tokenDeSeguridad();
    const sessionKey = await this.niubiz.crearSesion(token, {
      monto: total,
      email: usuario.email,
      usuarioId: usuario.id,
      clientIp: ipv4(ip),
    });

    const pago = await this.paymentsRepo.save(
      this.paymentsRepo.create({
        purchaseNumber: nuevoPurchaseNumber(),
        usuario: { id: usuario.id } as Usuario,
        items: dto.items.map((i) => ({ componentId: i.componentId, cantidad: i.cantidad })),
        direccion: dto.direccion ?? null,
        monto: total,
        estado: 'pendiente',
      }),
    );

    const backend = (process.env.BACKEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    return {
      sessionKey,
      merchantId: this.niubiz.merchantId,
      purchaseNumber: pago.purchaseNumber,
      monto: total,
      checkoutJsUrl: this.niubiz.checkoutJsUrl,
      // Niubiz manda el resultado del formulario a esta dirección (un POST del navegador)
      actionUrl: `${backend}/payments/niubiz/confirm?purchaseNumber=${pago.purchaseNumber}`,
    };
  }

  // 2) Niubiz devuelve al cliente con un transactionToken: el servidor confirma el cobro con Niubiz
  //    y recién entonces crea el pedido. La URL ya no decide nada.
  async confirmar(purchaseNumber: string, transactionToken?: string) {
    const pago = await this.paymentsRepo.findOne({ where: { purchaseNumber }, relations: { usuario: true } });
    if (!pago) return;

    // Se "toma" el pago: solo pasa de pendiente a procesando una vez.
    // Si Niubiz (o alguien recargando la página) llama dos veces, la segunda no hace nada.
    const tomado = await this.paymentsRepo.update({ id: pago.id, estado: 'pendiente' }, { estado: 'procesando' });
    if (!tomado.affected) return;

    if (!transactionToken) {
      await this.paymentsRepo.update(pago.id, { estado: 'rechazado', mensaje: 'Pago cancelado o sin respuesta de Niubiz' });
      return;
    }

    let resultado;
    try {
      const token = await this.niubiz.tokenDeSeguridad();
      resultado = await this.niubiz.autorizar(token, { transactionToken, purchaseNumber, monto: Number(pago.monto) });
    } catch (err) {
      this.logger.error(`No se pudo autorizar el pago ${purchaseNumber}: ${(err as Error).message}`);
      await this.paymentsRepo.update(pago.id, { estado: 'rechazado', mensaje: 'No se pudo confirmar el pago con Niubiz' });
      return;
    }

    const datosNiubiz = {
      actionCode: resultado.actionCode,
      mensaje: resultado.mensaje,
      codigoAutorizacion: resultado.codigoAutorizacion,
      tarjeta: resultado.tarjeta,
      marca: resultado.marca,
    };

    if (!resultado.aprobado) {
      await this.paymentsRepo.update(pago.id, { estado: 'rechazado', ...datosNiubiz });
      return;
    }

    try {
      const pedido = await this.ordersService.create(pago.usuario.id, {
        direccion: pago.direccion ?? undefined,
        items: pago.items,
      });
      if (pedido.total !== Number(pago.monto)) {
        // Un precio cambió entre que se abrió el pago y se confirmó: el pedido queda, pero se avisa
        this.logger.warn(`Pago ${purchaseNumber}: se cobró ${pago.monto} y el pedido suma ${pedido.total}`);
      }
      await this.paymentsRepo.update(pago.id, { estado: 'aprobado', order: { id: pedido.id }, ...datosNiubiz });
    } catch (err) {
      // Niubiz cobró pero el pedido no se pudo crear (ej. un producto se agotó): hay que revisarlo a mano
      this.logger.error(`Pago ${purchaseNumber} aprobado pero sin pedido: ${(err as Error).message}`);
      await this.paymentsRepo.update(pago.id, { estado: 'pagado_sin_pedido', ...datosNiubiz });
    }
  }

  // 3) La página de resultado pregunta cómo terminó el pago. Solo el dueño (o un admin) lo puede ver.
  async consultar(usuario: UsuarioToken, purchaseNumber: string) {
    const pago = await this.paymentsRepo.findOne({
      where: { purchaseNumber },
      relations: { usuario: true, order: true },
    });
    if (!pago || (usuario.rol !== 'admin' && pago.usuario.id !== usuario.id)) {
      throw new NotFoundException('Pago no encontrado');
    }
    return {
      purchaseNumber: pago.purchaseNumber,
      estado: pago.estado,
      monto: Number(pago.monto),
      orderId: pago.order ? formatoPedido(pago.order.id) : null,
      mensaje: pago.mensaje,
      codigoAutorizacion: pago.codigoAutorizacion,
      tarjeta: pago.tarjeta,
      marca: pago.marca,
    };
  }
}