import { Controller, Get, Post, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('usuario/:usuarioId')
  findByUser(@Param('usuarioId') usuarioId: string) {
    return this.wishlistService.findByUser(+usuarioId);
  }

  @Post()
  add(@Body() body: { usuarioId: number; componentId: number }) {
    return this.wishlistService.add(body.usuarioId, body.componentId);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(+id);
  }
}
