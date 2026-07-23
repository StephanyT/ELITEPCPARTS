import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
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

  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.emailVerificationsService.findByToken(token);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailVerificationsService.findOne(+id);
  }

  @Post()
  @ApiBody({ schema: { example: { usuario_id: 1, token: 'abc123', usado: false } } })
  create(@Body() createEmailVerificationDto: CreateEmailVerificationDto) {
    return this.emailVerificationsService.create(createEmailVerificationDto);
  }

  @Patch('validar/:token')
  validateToken(@Param('token') token: string) {
    return this.emailVerificationsService.validateToken(token);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emailVerificationsService.remove(+id);
  }
}
