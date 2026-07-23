import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationsModule } from '../email_verifications/email_verification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), EmailVerificationsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
