import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { EmailVerification } from './email-verification.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { MailService } from '../mail/mail.service';

// El enlace del correo vale 24 horas
const VIGENCIA_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class EmailVerificationsService {
  constructor(
    @InjectRepository(EmailVerification)
    private emailVerificationsRepository: Repository<EmailVerification>,
    private mailService: MailService,
  ) {}

  async createAndSend(usuario: Usuario) {
    const token = randomBytes(32).toString('hex');
    const verification = await this.emailVerificationsRepository.save({
      usuario,
      token,
      usado: false,
    });

    this.ensureMailConfigured();

    try {
      await this.mailService.sendVerification(usuario.email, usuario.nombre, token);
    } catch {
      throw new InternalServerErrorException('No se pudo enviar el correo de verificación');
    }

    return verification;
  }

  async validateToken(token: string) {
    // Sin esto, un token vacío hacía que TypeORM ignorara el filtro
    // y verificara la primera cuenta pendiente de la tabla.
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
      throw new BadRequestException('Token de verificación inválido');
    }

    return this.emailVerificationsRepository.manager.transaction(async (manager) => {
      const emailVerificationsRepository = manager.getRepository(EmailVerification);
      const usuariosRepository = manager.getRepository(Usuario);

      const verification = await emailVerificationsRepository.findOne({
        where: { token },
        relations: { usuario: true },
      });

      if (!verification || !verification.usuario) {
        throw new NotFoundException('Token de verificación no encontrado');
      }

      if (verification.usado) {
        throw new BadRequestException('Este enlace ya fue usado');
      }

      if (Date.now() - new Date(verification.creado_en).getTime() > VIGENCIA_MS) {
        throw new BadRequestException('El enlace venció. Pide uno nuevo desde el login.');
      }

      verification.usado = true;
      await emailVerificationsRepository.save(verification);
      await usuariosRepository.update(verification.usuario.id, { verificado: true });

      return { mensaje: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.' };
    });
  }

  private ensureMailConfigured() {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new InternalServerErrorException('Falta la configuración de correo (MAIL_HOST, MAIL_USER, MAIL_PASS)');
    }
  }
}
