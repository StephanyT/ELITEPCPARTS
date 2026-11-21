import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationsService } from './email_verification.service';
import { EmailVerification } from './email-verification.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { MailModule } from '../mail/mail.module';

// Ya no tiene controlador propio: listar o crear tokens desde la API dejaba
// verificar cualquier cuenta. La verificación se hace solo por GET /auth/verificar.
@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification, Usuario]), MailModule],
  providers: [EmailVerificationsService],
  exports: [EmailVerificationsService],
})
export class EmailVerificationsModule {}