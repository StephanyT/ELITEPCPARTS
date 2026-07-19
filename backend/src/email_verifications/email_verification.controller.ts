import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { EmailVerificationsService } from './email_verification.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateEmailVerificationDto } from './email-verification.dto';

@ApiTags('email_verifications')
@Controller('email_verifications')
export class EmailVerificationsController {
  constructor(private readonly emailVerificationsService: EmailVerificationsService) {}

  @Get()
  findAll() {
    return this.emailVerificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailVerificationsService.findOne(+id);
  }

  @Post()
  @ApiBody({ schema: { example: { token: 'abc123', usado: false } } })
  create(@Body() createEmailVerificationDto: CreateEmailVerificationDto) {
    return this.emailVerificationsService.create(createEmailVerificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emailVerificationsService.remove(+id);
  }
}