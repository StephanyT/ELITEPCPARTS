import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Component } from '../components/component.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Component)
  @JoinColumn({ name: 'component_id' })
  component!: Component;

  @Column()
  cantidad!: number;
}
