import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contacto')
export class Contacto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  apellido!: string;

  @Column()
  email!: string;

  @Column()
  asunto!: string;

  @Column('text')
  mensaje!: string;

  @CreateDateColumn()
  creado_en!: Date;
}
