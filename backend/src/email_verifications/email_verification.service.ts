import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './email-verification.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CreateEmailVerificationDto } from './email-verification.dto';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationsService {
  constructor(
    @InjectRepository(EmailVerification)
    private emailVerificationsRepository: Repository<EmailVerification>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private mailService: MailService,
  ) {}

  findAll() {
    return this.emailVerificationsRepository.find({ relations: { usuario: true } });
  }

  findOne(id: number) {
    return this.emailVerificationsRepository.findOne({ where: { id }, relations: { usuario: true } });
  }

  async findByToken(token: string) {
    const verification = await this.emailVerificationsRepository.findOne({
      where: { token },
      relations: { usuario: true },
    });

    if (!verification) {
      throw new NotFoundException('Token de verificación no encontrado');
    }

    return verification;
  }

  async create(data: CreateEmailVerificationDto) {
    const usuario = await this.usuariosRepository.findOneBy({ id: data.usuario_id });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const verification = this.emailVerificationsRepository.create({
      usuario,
      token: data.token,
      usado: data.usado ?? false,
    });

    return this.emailVerificationsRepository.save(verification);
  }

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
      throw new InternalServerErrorException(
        'Usuario creado y token guardado, pero no se pudo enviar el correo de verificacion',
      );
    }

    return verification;
  }

  async validateToken(token: string) {
    return this.emailVerificationsRepository.manager.transaction(async (manager) => {
      const emailVerificationsRepository = manager.getRepository(EmailVerification);
      const usuariosRepository = manager.getRepository(Usuario);

      const verification = await emailVerificationsRepository.findOne({
        where: { token },
        relations: { usuario: true },
      });

      if (!verification) {
        throw new NotFoundException('Token de verificacion no encontrado');
      }

      if (verification.usado) {
        throw new BadRequestException('Token ya utilizado');
      }

      if (!verification.usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      verification.usado = true;
      verification.usuario.verificado = true;

      await emailVerificationsRepository.save(verification);
      await usuariosRepository.save(verification.usuario);

      return { mensaje: 'Cuenta verificada correctamente. Ya puedes iniciar sesion.' };
    });
  }

  async remove(id: number) {
    await this.emailVerificationsRepository.delete(id);
    return { deleted: true };
  }

  private ensureMailConfigured() {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new InternalServerErrorException(
        'Usuario creado y token guardado, pero falta configuracion de correo para enviar la verificacion',
      );
    }
  }
}
