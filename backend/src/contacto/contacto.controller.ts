import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './contacto.dto';
import { Public, Roles } from '../auth/auth.decorators';

@ApiTags('contacto')
@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  // Cualquiera puede escribirle a la tienda, sin necesidad de cuenta
  @Public()
  @Post()
  create(@Body() dto: CreateContactoDto) {
    return this.contactoService.create(dto);
  }

  // Leer los mensajes (con nombres y correos de la gente): solo admin
  @Roles('admin')
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.contactoService.findAll();
  }
}