import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { EmailVerificationsService } from '../email_verifications/email_verification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private emailVerificationsService: EmailVerificationsService,
  ) { }

  async login(email: string, password: string) {
    const usuario = await this.usuariosRepository.findOneBy({ email });
    if (!usuario || usuario.password !== password) {
      throw new UnauthorizedException('Email o contrasena incorrectos');
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      verificado: usuario.verificado,
    };
  }

  async verificarEmail(token: string) {
    return this.emailVerificationsService.validateToken(token);
  }
}
