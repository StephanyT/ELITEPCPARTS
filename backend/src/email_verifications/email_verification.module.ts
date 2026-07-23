import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationsController } from './email_verification.controller';
import { EmailVerificationsService } from './email_verification.service';
import { EmailVerification } from './email-verification.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification, Usuario]), MailModule],
  controllers: [EmailVerificationsController],
  providers: [EmailVerificationsService],
  exports: [EmailVerificationsService],
})
export class EmailVerificationsModule {}
