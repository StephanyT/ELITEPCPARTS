import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './order.dto';
import { CurrentUser, Roles } from '../auth/auth.decorators';
import type { UsuarioToken } from '../auth/auth.decorators';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Todos los pedidos de la tienda: solo admin
  @Roles('admin')
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // Mis pedidos (antes era /orders/usuario/:id y se podían ver los de cualquiera)
  @Get('mine')
  findMine(@CurrentUser() usuario: UsuarioToken) {
    return this.ordersService.findByUser(usuario.id);
  }

  @Get(':id')
  findOne(@CurrentUser() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(usuario, id);
  }

  @Post()
  @ApiBody({ schema: { example: { direccion: 'Av. Siempre Viva 123, Lima', items: [{ componentId: 1, cantidad: 1 }] } } })
  create(@CurrentUser() usuario: UsuarioToken, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(usuario.id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
