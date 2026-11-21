import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import type { Rol } from '../auth/auth.decorators';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  nombre!: string;

  // select: false → el hash nunca sale en un find() normal, ni por accidente
  @Column({ select: false })
  password!: string;

  @Column({ default: false })
  verificado!: boolean;

  @Column({ type: 'varchar', default: 'cliente' })
  rol!: Rol;

  @CreateDateColumn()
  creado_en!: Date;
}