import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Usuario } from './usuarios/usuario.entity';
import { Component } from './components/component.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './order_items/order-item.entity';
import { Cart } from './cart/cart.entity';
import { Review } from './reviews/review.entity';
import { Wishlist } from './wishlist/wishlist.entity';
import { EmailVerification } from './email_verifications/email-verification.entity';
import { Contacto } from './contacto/contacto.entity';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ComponentsModule } from './components/components.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { EmailVerificationsModule } from './email_verifications/email_verification.module';
import { LoggerMiddleware } from './logger.middleware';
import { AuthModule } from './auth/auth.module';
import { ContactoModule } from './contacto/contacto.module';
import { MailModule } from './mail/mail.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { isProduction, requiredEnv } from './config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USER || 'admin',
        // Sin contraseña por defecto en el código: tiene que venir del entorno
        password: requiredEnv('DB_PASSWORD'),
        database: process.env.DB_NAME || 'elitepcparts',
        entities: [Usuario, Component, Order, OrderItem, Cart, Review, Wishlist, EmailVerification, Contacto],
        // synchronize cambia las tablas solo. Útil en desarrollo, peligroso en producción.
        synchronize: !isProduction(),
      }),
    }),
    // Límite general: 100 peticiones por minuto por IP. Algunas rutas tienen uno más estricto.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    UsuariosModule,
    ComponentsModule,
    OrdersModule,
    OrderItemsModule,
    CartModule,
    ReviewsModule,
    WishlistModule,
    EmailVerificationsModule,
    AuthModule,
    ContactoModule,
    MailModule,
  ],
  providers: [
    // Los guards globales corren en este orden en cada petición:
    // 1) límite de peticiones  2) ¿token válido?  3) ¿tiene el rol necesario?
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
