import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuario.entity';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { Public } from '../auth/auth.decorators';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  // Registro: tiene que ser público, porque quien se registra todavía no tiene cuenta
  @Public()
  @Post()
  @ApiBody({ schema: { example: { nombre: 'Test', email: 'test@test.com', password: '123456' } } })
  create(@Body() data: Partial<Usuario>) {
    return this.usuariosService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}