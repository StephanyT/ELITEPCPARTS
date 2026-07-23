import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter() {
    const host = process.env.MAIL_HOST;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.MAIL_PORT ?? '587'),
      secure: false,
      auth: { user, pass },
    });
  }

  async sendVerification(email: string, nombre: string, token: string) {
    const t = this.transporter();
    if (!t) return;

    const link = `http://localhost/src/pages/verificado.html?token=${token}`;

    await t.sendMail({
      from: `"Elite PC Parts" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Verifica tu cuenta — Elite PC Parts',
      html: `
        <h2>Hola ${nombre},</h2>
        <p>Gracias por registrarte en Elite PC Parts.</p>
        <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${link}" style="background:#1e40af;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Verificar cuenta
        </a>
        <p>Si no creaste esta cuenta, ignora este correo.</p>
      `,
    });
  }

  async sendOrderConfirmation(datos: {
    email: string;
    nombre: string;
    orderId: string;
    items: { nombre?: string; cantidad: number; precio_unitario: number }[];
    total: number;
    direccion?: string;
  }) {
    const t = this.transporter();
    if (!t) return;

    const fechaEntregaMin = new Date();
    const fechaEntregaMax = new Date();
    fechaEntregaMin.setDate(fechaEntregaMin.getDate() + 3);
    fechaEntregaMax.setDate(fechaEntregaMax.getDate() + 5);
    const fmt = (d: Date) =>
      d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

    const itemsHtml = datos.items.map(item => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee">${item.nombre || 'Producto'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.cantidad}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">S/ ${Number(item.precio_unitario).toLocaleString('es-PE')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">S/ ${(Number(item.precio_unitario) * item.cantidad).toLocaleString('es-PE')}</td>
      </tr>`).join('');

    const direccionHtml = datos.direccion
      ? `<p style="margin:4px 0"><strong>Dirección de envío:</strong> ${datos.direccion}</p>`
      : '';

    await t.sendMail({
      from: `"Elite PC Parts" <${process.env.MAIL_USER}>`,
      to: datos.email,
      subject: `Confirmación de pedido ${datos.orderId} — Elite PC Parts`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#003087,#0066CC);padding:32px 30px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.5px">
        <span style="color:#FFD700">ELITE</span> PC PARTS
      </h1>
      <p style="color:rgba(255,255,255,.8);margin:6px 0 0;font-size:13px">Tu tienda de confianza para armar la PC de tus sueños</p>
    </div>

    <!-- Cuerpo -->
    <div style="padding:32px 30px">
      <h2 style="color:#003087;margin:0 0 6px">¡Gracias por tu compra, ${datos.nombre}!</h2>
      <p style="color:#555;margin:0 0 24px;font-size:15px">Hemos recibido tu pedido y está siendo procesado.</p>

      <!-- ID pedido -->
      <div style="background:#f0f4ff;border:2px solid #003087;border-radius:10px;padding:16px 20px;text-align:center;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:.08em">Número de pedido</p>
        <p style="margin:6px 0 0;font-size:1.6rem;font-weight:900;color:#003087;font-family:'Courier New',monospace">${datos.orderId}</p>
      </div>

      <!-- Tabla de productos -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <thead>
          <tr style="background:#003087">
            <th style="padding:10px 12px;color:#fff;text-align:left;font-size:13px">Producto</th>
            <th style="padding:10px 12px;color:#fff;text-align:center;font-size:13px">Cant.</th>
            <th style="padding:10px 12px;color:#fff;text-align:right;font-size:13px">Precio unit.</th>
            <th style="padding:10px 12px;color:#fff;text-align:right;font-size:13px">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:12px;text-align:right;font-weight:bold;font-size:15px">Total:</td>
            <td style="padding:12px;text-align:right;font-weight:900;font-size:17px;color:#003087">S/ ${Number(datos.total).toLocaleString('es-PE')}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Entrega -->
      <div style="background:#e8f5e9;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px">
        <p style="margin:0 0 6px;font-weight:bold;color:#155724;font-size:14px">🚚 Estimado de entrega</p>
        <p style="margin:0;color:#155724;font-size:14px">Entre el <strong>${fmt(fechaEntregaMin)}</strong> y el <strong>${fmt(fechaEntregaMax)}</strong> (3–5 días hábiles)</p>
        ${direccionHtml}
      </div>

      <p style="color:#555;font-size:14px">Si tienes alguna pregunta sobre tu pedido, escríbenos a <a href="mailto:contacto@elitepcparts.com" style="color:#003087">contacto@elitepcparts.com</a> o llámanos al <strong>+51 1 234-5678</strong>.</p>
    </div>

    <!-- Footer -->
    <div style="background:#f8f9fb;padding:20px 30px;text-align:center;border-top:1px solid #eee">
      <p style="margin:0;color:#999;font-size:12px">© 2026 Elite PC Parts · San Isidro, Lima, Perú</p>
      <p style="margin:6px 0 0;color:#bbb;font-size:11px">Este es un entorno de demostración. No se realizó ningún cobro real.</p>
    </div>

  </div>
</body>
</html>`,
    });
  }

  async sendContactNotification(datos: {
    nombre: string;
    apellido: string;
    email: string;
    asunto: string;
    mensaje: string;
  }) {
    const t = this.transporter();
    if (!t) return;

    const to = process.env.MAIL_TO;
    if (!to) return;

    await t.sendMail({
      from: `"Elite PC Parts" <${process.env.MAIL_USER}>`,
      to,
      subject: `Nuevo mensaje: ${datos.asunto}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${datos.nombre} ${datos.apellido}</p>
        <p><strong>Email:</strong> ${datos.email}</p>
        <p><strong>Asunto:</strong> ${datos.asunto}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${datos.mensaje}</p>
      `,
    });
  }
}
