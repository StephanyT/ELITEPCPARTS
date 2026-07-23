import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuario.entity';
import { EmailVerification } from '../email_verifications/email-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, EmailVerification])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
