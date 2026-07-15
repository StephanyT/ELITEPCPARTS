import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Component } from '../components/component.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @ManyToOne(() => Component)
  component!: Component;

  @Column()
  cantidad!: number;
}