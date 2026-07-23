import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuarios/usuario.entity';
import { Component } from './components/component.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './order_items/order-item.entity';
import { Cart } from './cart/cart.entity';
import { Review } from './reviews/review.entity';
import { EmailVerification } from './email_verifications/email-verification.entity';
import { Contacto } from './contacto/contacto.entity';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ComponentsModule } from './components/components.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { EmailVerificationsModule } from './email_verifications/email_verification.module';
import { LoggerMiddleware } from './logger.middleware';
import { AuthModule } from './auth/auth.module';
import { ContactoModule } from './contacto/contacto.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'secret',
      database: process.env.DB_NAME || 'elitepcparts',
      entities: [Usuario, Component, Order, OrderItem, Cart, Review, EmailVerification, Contacto],
      synchronize: true,
    }),
    UsuariosModule,
    ComponentsModule,
    OrdersModule,
    OrderItemsModule,
    CartModule,
    ReviewsModule,
    EmailVerificationsModule,
    AuthModule,
    ContactoModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}