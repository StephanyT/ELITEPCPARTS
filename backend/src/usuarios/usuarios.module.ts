import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuario.entity';
import { EmailVerificationsModule } from '../email_verifications/email_verification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), EmailVerificationsModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
