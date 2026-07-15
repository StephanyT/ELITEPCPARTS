import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @Column('decimal')
  total!: number;

  @Column({ default: 'pendiente' })
  estado!: string;

  @CreateDateColumn()
  creado_en!: Date;
}