import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/usuario.entity';
import { EmailVerificationsService } from '../email_verifications/email_verification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private emailVerificationsService: EmailVerificationsService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // password tiene select: false en la entidad, así que hay que pedirlo a propósito
    const usuario = await this.usuariosRepository
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email: email.trim().toLowerCase() })
      .getOne();

    // Mismo mensaje si no existe o si la clave está mal: así no se puede adivinar qué correos están registrados
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Recién después de comprobar la contraseña se revisa si verificó su correo
    if (!usuario.verificado) {
      throw new ForbiddenException('Debes verificar tu correo antes de iniciar sesión');
    }

    const token = await this.jwtService.signAsync({ sub: usuario.id, rol: usuario.rol });

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async verificarEmail(token: string) {
    return this.emailVerificationsService.validateToken(token);
  }

  async reenviarVerificacion(email: string) {
    const usuario = await this.usuariosRepository.findOneBy({ email: email.trim().toLowerCase() });
    if (usuario && !usuario.verificado) {
      try {
        await this.emailVerificationsService.createAndSend(usuario);
      } catch (err) {
        // Si el correo falla no respondemos 500: eso revelaría que la cuenta existe
        this.logger.error(`No se pudo reenviar la verificación: ${(err as Error).message}`);
      }
    }
    // Siempre la misma respuesta, exista o no el correo
    return { mensaje: 'Si el correo está registrado y no fue verificado, te enviamos un nuevo enlace.' };
  }
}