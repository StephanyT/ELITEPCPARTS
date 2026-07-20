import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Component } from '../components/component.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order)
  order!: Order;

  @ManyToOne(() => Component)
  component!: Component;

  @Column()
  cantidad!: number;

  @Column('decimal')
  precio_unitario!: number;
}