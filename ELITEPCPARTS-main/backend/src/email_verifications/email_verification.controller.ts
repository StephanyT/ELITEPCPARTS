import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { EmailVerificationsService } from './email_verification.service';
import { EmailVerification } from './email-verification.entity';
import { ApiTags, ApiBody } from '@nestjs/swagger';

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
  create(@Body() data: Partial<EmailVerification>) {
    return this.emailVerificationsService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emailVerificationsService.remove(+id);
  }
}