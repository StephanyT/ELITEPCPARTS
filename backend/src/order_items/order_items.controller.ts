import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OrderItemsService } from './order_items.service';
import { CreateOrderItemDto } from './order-item.dto';
import { Roles } from '../auth/auth.decorators';

// Uso interno de administración: los clientes ven sus ítems dentro de sus pedidos
@ApiTags('order_items')
@ApiBearerAuth()
@Roles('admin')
@Controller('order_items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get()
  findAll() {
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderItemsService.findOne(+id);
  }

  @Post()
  @ApiBody({ schema: { example: { cantidad: 1, precio_unitario: 1599.99 } } })
  create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemsService.create(createOrderItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderItemsService.remove(+id);
  }
}