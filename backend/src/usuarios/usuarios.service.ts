import { ConflictException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './usuario.dto';
import { EmailVerificationsService } from '../email_verifications/email_verification.service';

@Injectable()
export class UsuariosService implements OnModuleInit {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private emailVerificationsService: EmailVerificationsService,
  ) {}

  // Al arrancar, crea la cuenta admin si ADMIN_EMAIL y ADMIN_PASSWORD están en el .env.
  // Es la única forma de tener un admin: nadie puede darse ese rol desde la API.
  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;

    const existente = await this.usuariosRepository.findOneBy({ email });
    if (existente) {
      if (existente.rol !== 'admin' || !existente.verificado) {
        await this.usuariosRepository.update(existente.id, { rol: 'admin', verificado: true });
      }
      return;
    }

    await this.usuariosRepository.save(
      this.usuariosRepository.create({
        email,
        nombre: 'Administrador',
        password: await bcrypt.hash(password, 10),
        verificado: true,
        rol: 'admin',
      }),
    );
    this.logger.log(`Cuenta admin creada: ${email}`);
  }

  findAll() {
    return this.usuariosRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const email = dto.email.trim().toLowerCase();

    if (await this.usuariosRepository.existsBy({ email })) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    // Se arma el usuario campo por campo: nada del body se copia directo a la entidad
    const usuario = this.usuariosRepository.create({
      nombre: dto.nombre.trim(),
      email,
      password: await bcrypt.hash(dto.password, 10),
      verificado: false,
      rol: 'cliente',
    });
    let guardado: Usuario;
    try {
      guardado = await this.usuariosRepository.save(usuario);
    } catch (err) {
      // Por si dos registros con el mismo correo llegan al mismo tiempo (código 23505 = unique)
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException('Ya existe una cuenta con ese email');
      }
      throw err;
    }

    try {
      await this.emailVerificationsService.createAndSend(guardado);
    } catch (err) {
      // La cuenta ya existe: no devolvemos error 500, el usuario puede pedir que se reenvíe el correo
      this.logger.error(`No se pudo enviar la verificación a ${email}: ${(err as Error).message}`);
      return {
        mensaje: 'Cuenta creada, pero no pudimos enviar el correo de verificación. Intenta reenviarlo desde el login.',
      };
    }

    return { mensaje: 'Usuario creado. Revisa tu correo para verificar tu cuenta.' };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.usuariosRepository.delete(id);
    return { deleted: true };
  }
}