import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Usuario } from '../usuarios/usuario.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationsModule } from '../email_verifications/email_verification.module';
import { requiredEnv } from '../config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    EmailVerificationsModule,
    // global: true para que el guard pueda usar JwtService en toda la app
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: requiredEnv('JWT_SECRET'),
        signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as any },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
