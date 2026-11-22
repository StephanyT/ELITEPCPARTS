import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto, UpdateCartDto } from './cart.dto';
import { CurrentUser } from '../auth/auth.decorators';
import type { UsuarioToken } from '../auth/auth.decorators';

// Antes el usuario venía en el header "usuario-id" y cualquiera podía poner otro número.
// Ahora sale del token, así que cada quien solo toca su propio carrito.
@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findAll(@CurrentUser() usuario: UsuarioToken) {
    return this.cartService.findByUsuario(usuario.id);
  }

  @Post()
  @ApiBody({ schema: { example: { component_id: 1, cantidad: 2 } } })
  create(@CurrentUser() usuario: UsuarioToken, @Body() dto: CreateCartDto) {
    return this.cartService.agregar(usuario.id, dto.component_id, dto.cantidad);
  }

  @Patch(':id')
  @ApiBody({ schema: { example: { cantidad: 3 } } })
  update(
    @CurrentUser() usuario: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.actualizarCantidad(usuario.id, id, dto.cantidad);
  }

  @Delete(':id')
  remove(@CurrentUser() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeItem(usuario.id, id);
  }

  @Delete()
  clear(@CurrentUser() usuario: UsuarioToken) {
    return this.cartService.vaciar(usuario.id);
  }
}