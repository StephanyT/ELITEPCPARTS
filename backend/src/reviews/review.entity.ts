import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Component } from '../components/component.entity';

@Entity('reviews')
@Unique(['usuario', 'component'])
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @ManyToOne(() => Component)
  component!: Component;

  @Column()
  calificacion!: number;

  @Column({ nullable: true })
  comentario!: string;

  @CreateDateColumn()
  creado_en!: Date;
}