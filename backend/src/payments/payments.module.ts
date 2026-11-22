import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { NiubizClient } from './niubiz.client';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Usuario]), OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, NiubizClient],
})
export class PaymentsModule {}