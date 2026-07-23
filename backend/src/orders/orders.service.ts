import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from '../order_items/order-item.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { MailService } from '../mail/mail.service';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemsRepo: Repository<OrderItem>,
    @InjectRepository(Usuario)
    private usuariosRepo: Repository<Usuario>,
    private mailService: MailService,
  ) {}

  findAll() {
    return this.ordersRepo.find({
      relations: { usuario: true, orderItems: { component: true } },
      order: { creado_en: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.ordersRepo.findOne({
      where: { id },
      relations: { usuario: true, orderItems: { component: true } },
    });
  }

  findByUser(usuarioId: number) {
    return this.ordersRepo.find({
      where: { usuario: { id: usuarioId } },
      relations: { orderItems: { component: true } },
      order: { creado_en: 'DESC' },
    });
  }

  async create(dto: CreateOrderDto) {
    const usuario = await this.usuariosRepo.findOne({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Crear el pedido
    const order = this.ordersRepo.create({
      usuario: { id: dto.usuarioId } as any,
      total: dto.total,
      estado: dto.estado || 'Procesando',
    });
    const savedOrder = await this.ordersRepo.save(order);

    // Crear los items del pedido
    for (const item of dto.items) {
      const orderItem = this.itemsRepo.create({
        order: { id: savedOrder.id } as any,
        component: { id: item.componentId } as any,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      });
      await this.itemsRepo.save(orderItem);
    }

    // Número de pedido formateado
    const orderId = 'EPC-' + String(savedOrder.id).padStart(6, '0');

    // Enviar email (no bloquea si falla)
    this.mailService.sendOrderConfirmation({
      email: usuario.email,
      nombre: usuario.nombre,
      orderId,
      items: dto.items,
      total: dto.total,
      direccion: dto.direccion,
    }).catch(err => console.error('Error enviando email de pedido:', err));

    return { id: savedOrder.id, orderId, estado: savedOrder.estado, creado_en: savedOrder.creado_en };
  }

  async remove(id: number) {
    await this.ordersRepo.delete(id);
    return { deleted: true };
  }
}
