import { Controller, Post, Get, Body } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './contacto.dto';
import { Public } from '../auth/auth.decorators';

@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  // Cualquiera puede escribirle a la tienda, sin necesidad de cuenta
  @Public()
  @Post()
  create(@Body() dto: CreateContactoDto) {
    return this.contactoService.create(dto);
  }

  @Get()
  findAll() {
    return this.contactoService.findAll();
  }
}