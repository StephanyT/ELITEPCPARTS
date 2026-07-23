import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contacto } from './contacto.entity';
import { CreateContactoDto } from './contacto.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactoService {
  constructor(
    @InjectRepository(Contacto)
    private contactoRepository: Repository<Contacto>,
  ) {}

  async create(dto: CreateContactoDto): Promise<Contacto> {
    const contacto = this.contactoRepository.create(dto);
    const guardado = await this.contactoRepository.save(contacto);
    await this.enviarCorreo(dto);
    return guardado;
  }

  findAll(): Promise<Contacto[]> {
    return this.contactoRepository.find({ order: { creado_en: 'DESC' } });
  }

  private async enviarCorreo(dto: CreateContactoDto) {
    const host = process.env.MAIL_HOST;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    const to   = process.env.MAIL_TO;

    if (!host || !user || !pass || !to) return;

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.MAIL_PORT ?? '587'),
      secure: false,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Elite PC Parts" <${user}>`,
      to,
      subject: `Nuevo mensaje: ${dto.asunto}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${dto.nombre} ${dto.apellido}</p>
        <p><strong>Email:</strong> ${dto.email}</p>
        <p><strong>Asunto:</strong> ${dto.asunto}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${dto.mensaje}</p>
      `,
    });
  }
}
