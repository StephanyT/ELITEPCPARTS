import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ComponentsService } from './components.service';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateComponentDto } from './component.dto';
import { Public, Roles } from '../auth/auth.decorators';

@ApiTags('components')
@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  // Ver el catálogo es público (el healthcheck de Docker también usa esta ruta)
  @Public()
  @Get()
  findAll() {
    return this.componentsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.componentsService.findOne(+id);
  }

  // Crear y borrar productos: solo admin
  @Roles('admin')
  @ApiBearerAuth()
  @Post()
  @ApiBody({ schema: { example: { nombre: 'RTX 4090', categoria: 'GPU', precio: 1599.99, imagen_url: 'https://example.com/img.jpg', disponible: true } } })
  create(@Body() createComponentDto: CreateComponentDto) {
    return this.componentsService.create(createComponentDto);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.componentsService.remove(+id);
  }
}