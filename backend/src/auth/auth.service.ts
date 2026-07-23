import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { EmailVerification } from '../email_verifications/email-verification.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(EmailVerification)
    private emailVerifRepository: Repository<EmailVerification>,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.usuariosRepository.findOneBy({ email });
    if (!usuario || usuario.password !== password) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      verificado: usuario.verificado,
    };
  }

  async verificarEmail(token: string) {
    const registro = await this.emailVerifRepository.findOne({
      where: { token, usado: false },
      relations: ['usuario'],
    });
    if (!registro) throw new BadRequestException('Token inválido o ya usado');

    await this.emailVerifRepository.update(registro.id, { usado: true });
    await this.usuariosRepository.update(registro.usuario.id, { verificado: true });

    return { mensaje: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.' };
  }
}
