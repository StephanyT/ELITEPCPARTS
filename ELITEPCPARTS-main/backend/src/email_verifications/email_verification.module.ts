import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationsController } from './email_verification.controller';
import { EmailVerificationsService } from './email_verification.service';
import { EmailVerification } from './email-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification])],
  controllers: [EmailVerificationsController],
  providers: [EmailVerificationsService],
})
export class EmailVerificationsModule {}