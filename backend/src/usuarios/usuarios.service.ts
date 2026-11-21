import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
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