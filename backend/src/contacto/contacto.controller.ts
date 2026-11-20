import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './contacto.dto';
import { Public, Roles } from '../auth/auth.decorators';

@ApiTags('contacto')
@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  // Cualquiera puede escribir, pero con límite para evitar spam
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateContactoDto) {
    return this.contactoService.create(dto);
  }

  // Leer los mensajes: solo admin
  @Roles('admin')
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.contactoService.findAll();
  }
}
