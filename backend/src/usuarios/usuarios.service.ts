import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { EmailVerification } from '../email_verifications/email-verification.entity';
import { MailService } from '../mail/mail.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(EmailVerification)
    private emailVerifRepository: Repository<EmailVerification>,
    private mailService: MailService,
  ) {}

  findAll() {
    return this.usuariosRepository.find();
  }

  findOne(id: number) {
    return this.usuariosRepository.findOneBy({ id });
  }

  async create(data: Partial<Usuario>) {
    const usuario = this.usuariosRepository.create({ ...data, verificado: false });
    const guardado = await this.usuariosRepository.save(usuario);

    const token = randomUUID();
    await this.emailVerifRepository.save({ usuario: guardado, token, usado: false });
    await this.mailService.sendVerification(guardado.email, guardado.nombre, token);

    return { mensaje: 'Usuario creado. Revisa tu correo para verificar tu cuenta.' };
  }

  async remove(id: number) {
    await this.usuariosRepository.delete(id);
    return { deleted: true };
  }
}
