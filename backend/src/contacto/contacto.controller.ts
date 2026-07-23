import { Controller, Post, Get, Body } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './contacto.dto';

@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post()
  create(@Body() dto: CreateContactoDto) {
    return this.contactoService.create(dto);
  }

  @Get()
  findAll() {
    return this.contactoService.findAll();
  }
}
