import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { EmailVerificationsService } from '../email_verifications/email_verification.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private emailVerificationsService: EmailVerificationsService,
  ) {}

  findAll() {
    return this.usuariosRepository.find();
  }

  findOne(id: number) {
    return this.usuariosRepository.findOneBy({ id });
  }

  async create(data: Partial<Usuario>) {
    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const usuario = this.usuariosRepository.create({ ...data, password: hashedPassword, verificado: false });
    const guardado = await this.usuariosRepository.save(usuario);

    await this.emailVerificationsService.createAndSend(guardado);

    return { mensaje: 'Usuario creado. Revisa tu correo para verificar tu cuenta.' };
  }

  async remove(id: number) {
    await this.usuariosRepository.delete(id);
    return { deleted: true };
  }
}
