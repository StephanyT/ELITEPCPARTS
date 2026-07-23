import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { OrderItem } from '../order_items/order-item.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Usuario])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
