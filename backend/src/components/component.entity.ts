import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('components')
export class Component {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  categoria!: string;

  @Column('decimal')
  precio!: number;

  @Column()
  imagen_url!: string;

  @Column({ default: true })
  disponible!: boolean;
}