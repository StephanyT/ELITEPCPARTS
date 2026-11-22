import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './component.dto';
import { Public, Roles } from '../auth/auth.decorators';

@ApiTags('components')
@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  // Ver el catálogo es público
  @Public()
  @Get()
  findAll() {
    return this.componentsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.componentsService.findOne(id);
  }

  // Crear y borrar productos: solo admin
  @Roles('admin')
  @ApiBearerAuth()
  @Post()
  @ApiBody({ schema: { example: { nombre: 'RTX 4090', categoria: 'gpu', precio: 1599.99, imagen_url: '/src/assets/images/products/gpu_0.webp', disponible: true } } })
  create(@Body() dto: CreateComponentDto) {
    return this.componentsService.create(dto);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.componentsService.remove(id);
  }
}