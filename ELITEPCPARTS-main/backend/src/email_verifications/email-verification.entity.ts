import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('email_verifications')
export class EmailVerification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @Column()
  token!: string;

  @Column({ default: false })
  usado!: boolean;

  @CreateDateColumn()
  creado_en!: Date;
}