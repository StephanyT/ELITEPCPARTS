import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateCartDto, UpdateCartDto } from './cart.dto';

@ApiTags('cart')
@ApiHeader({
  name: 'usuario-id',
  required: true,
  description: 'ID del usuario autenticado. Se usa porque este proyecto todavía no tiene JWT.',
})
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findAll(@Headers('usuario-id') usuarioId: string) {
    return this.cartService.findByUsuario(this.parseUsuarioId(usuarioId));
  }

  @Post()
  @ApiBody({ schema: { example: { component_id: 1, cantidad: 2 } } })
  create(@Headers('usuario-id') usuarioId: string, @Body() createCartDto: CreateCartDto) {
    return this.cartService.agregar(
      this.parseUsuarioId(usuarioId),
      createCartDto.component_id,
      createCartDto.cantidad,
    );
  }

  @Patch(':id')
  @ApiBody({ schema: { example: { cantidad: 3 } } })
  update(
    @Headers('usuario-id') usuarioId: string,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.actualizarCantidad(this.parseUsuarioId(usuarioId), +id, updateCartDto.cantidad);
  }

  @Delete(':id')
  remove(@Headers('usuario-id') usuarioId: string, @Param('id') id: string) {
    return this.cartService.removeItem(this.parseUsuarioId(usuarioId), +id);
  }

  @Delete()
  clear(@Headers('usuario-id') usuarioId: string) {
    return this.cartService.vaciar(this.parseUsuarioId(usuarioId));
  }

  private parseUsuarioId(usuarioId: string) {
    const id = Number(usuarioId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Debe enviar el header usuario-id con un ID válido');
    }

    return id;
  }
}
