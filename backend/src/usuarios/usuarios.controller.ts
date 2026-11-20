import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './usuario.dto';
import { CurrentUser, Public, Roles } from '../auth/auth.decorators';
import type { UsuarioToken } from '../auth/auth.decorators';

@ApiTags('usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Registro: abierto, pero con límite para evitar que creen miles de cuentas
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @ApiBody({ schema: { example: { nombre: 'Test', email: 'test@test.com', password: '12345678' } } })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  // Mi perfil: el id sale del token
  @Get('me')
  me(@CurrentUser() usuario: UsuarioToken) {
    return this.usuariosService.findOne(usuario.id);
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
