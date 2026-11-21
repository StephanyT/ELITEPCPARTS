import { Controller, Get, Post, Delete, Param, Body, HttpCode, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './wishlist.dto';
import { CurrentUser } from '../auth/auth.decorators';
import type { UsuarioToken } from '../auth/auth.decorators';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // Mi lista de deseos (antes era /wishlist/usuario/:id y se podía ver la de cualquiera)
  @Get()
  findMine(@CurrentUser() usuario: UsuarioToken) {
    return this.wishlistService.findByUser(usuario.id);
  }

  @Post()
  add(@CurrentUser() usuario: UsuarioToken, @Body() dto: CreateWishlistDto) {
    return this.wishlistService.add(usuario.id, dto.componentId);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@CurrentUser() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.wishlistService.remove(usuario.id, id);
  }
}