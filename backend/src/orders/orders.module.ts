import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { OrderItem } from '../order_items/order-item.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Component } from '../components/component.entity';
import { Cart } from '../cart/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Usuario, Component, Cart])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
