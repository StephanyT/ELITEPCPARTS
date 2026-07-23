import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './email-verification.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CreateEmailVerificationDto } from './email-verification.dto';

@Injectable()
export class EmailVerificationsService {
  constructor(
    @InjectRepository(EmailVerification)
    private emailVerificationsRepository: Repository<EmailVerification>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
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

  async validateToken(token: string) {
    const verification = await this.findByToken(token);

    if (verification.usado) {
      throw new BadRequestException('Token ya utilizado');
    }

    verification.usado = true;

    return this.emailVerificationsRepository.save(verification);
  }

  async remove(id: number) {
    await this.emailVerificationsRepository.delete(id);
    return { deleted: true };
  }
}
