import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuarios/usuario.entity';
import { Component } from './components/component.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './order_items/order-item.entity';
import { Cart } from './cart/cart.entity';
import { Review } from './reviews/review.entity';
import { EmailVerification } from './email_verifications/email-verification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'secret',
      database: process.env.DB_NAME || 'elitepcparts',
      entities: [Usuario, Component, Order, OrderItem, Cart, Review, EmailVerification],
      synchronize: true,
    }),
  ],
})
export class AppModule {}