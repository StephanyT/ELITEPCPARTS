import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Component } from '../components/component.entity';

@Entity('wishlist')
@Unique(['usuario', 'component'])
export class Wishlist {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario!: Usuario;

  @ManyToOne(() => Component, { onDelete: 'CASCADE' })
  component!: Component;

  @CreateDateColumn()
  creado_en!: Date;
}
