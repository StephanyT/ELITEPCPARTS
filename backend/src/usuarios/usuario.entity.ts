import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  nombre!: string;

  @Column()
  password!: string;

  @Column({ default: false })
  verificado!: boolean;

  @CreateDateColumn()
  creado_en!: Date;
}