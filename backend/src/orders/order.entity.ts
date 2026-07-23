import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { OrderItem } from '../order_items/order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  orderItems!: OrderItem[];

  @Column('decimal')
  total!: number;

  @Column({ default: 'Procesando' })
  estado!: string;

  @CreateDateColumn()
  creado_en!: Date;
}