import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ComponentsService } from './components.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateComponentDto } from './component.dto';

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
  create(@Body() createComponentDto: CreateComponentDto) {
    return this.componentsService.create(createComponentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.componentsService.remove(+id);
  }
}