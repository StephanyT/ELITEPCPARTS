import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Order } from '../orders/order.entity';

// pendiente → procesando → aprobado | rechazado | pagado_sin_pedido
export type EstadoPago = 'pendiente' | 'procesando' | 'aprobado' | 'rechazado' | 'pagado_sin_pedido';

// Un intento de pago con Niubiz. Se crea al abrir el formulario de pago y guarda
// QUÉ se va a comprar, para que el pedido se arme en el servidor cuando Niubiz apruebe.
@Entity('pagos')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  // Número de compra que se le manda a Niubiz (solo dígitos, máximo 12)
  @Column({ unique: true, length: 12 })
  purchaseNumber!: string;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Usuario;

  // Lo que el cliente pidió: [{ componentId, cantidad }]. Los precios NO se guardan aquí:
  // se vuelven a leer de la base al crear el pedido.
  @Column('jsonb')
  items!: { componentId: number; cantidad: number }[];

  @Column({ type: 'varchar', length: 300, nullable: true })
  direccion!: string | null;

  // Monto que se le pidió cobrar a Niubiz (incluye envío)
  @Column('decimal')
  monto!: number;

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado!: EstadoPago;

  // El pedido que se creó cuando el pago fue aprobado
  @ManyToOne(() => Order, { nullable: true })
  order!: Order | null;

  // Datos que devuelve Niubiz (para mostrar y para auditoría)
  @Column({ type: 'varchar', length: 10, nullable: true })
  actionCode!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  mensaje!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigoAutorizacion!: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  tarjeta!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  marca!: string | null;

  @CreateDateColumn()
  creado_en!: Date;

  @UpdateDateColumn()
  actualizado_en!: Date;
}