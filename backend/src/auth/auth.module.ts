import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { EmailVerification } from '../email_verifications/email-verification.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, EmailVerification])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
