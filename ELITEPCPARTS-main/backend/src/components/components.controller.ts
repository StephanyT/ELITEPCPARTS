import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ComponentsService } from './components.service';
import { Component } from './component.entity';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('components')
@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Get()
  findAll() {
    return this.componentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.componentsService.findOne(+id);
  }

  @Post()
  @ApiBody({ schema: { example: { nombre: 'RTX 4090', categoria: 'GPU', precio: 1599.99, imagen_url: 'https://example.com/img.jpg', disponible: true } } })
  create(@Body() data: Partial<Component>) {
    return this.componentsService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.componentsService.remove(+id);
  }
}