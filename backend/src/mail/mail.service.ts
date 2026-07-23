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
