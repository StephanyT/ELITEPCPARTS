import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateOrderDto } from './order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUser(@Param('usuarioId') usuarioId: string) {
    return this.ordersService.findByUser(+usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Post()
  @ApiBody({ schema: { example: { total: 1599.99, estado: 'pendiente' } } })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}