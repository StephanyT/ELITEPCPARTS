import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateCartDto } from './cart.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Post()
  @ApiBody({ schema: { example: { cantidad: 2 } } })
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}