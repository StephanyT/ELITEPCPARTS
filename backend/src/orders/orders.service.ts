import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from '../order_items/order-item.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Component } from '../components/component.entity';
import { Cart } from '../cart/cart.entity';
import { MailService } from '../mail/mail.service';
import { CreateOrderDto } from './order.dto';
import type { UsuarioToken } from '../auth/auth.decorators';

export const formatoPedido = (id: number) => 'EPC-' + String(id).padStart(6, '0');

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
    @InjectRepository(Usuario)
    private usuariosRepo: Repository<Usuario>,
    @InjectDataSource()
    private dataSource: DataSource,
    private mailService: MailService,
  ) {}

  findAll() {
    return this.ordersRepo.find({
      relations: { usuario: true, orderItems: { component: true } },
      order: { creado_en: 'DESC' },
    });
  }

  // Un pedido lo puede ver su dueño o un admin
  async findOne(usuario: UsuarioToken, id: number) {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: { usuario: true, orderItems: { component: true } },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (usuario.rol !== 'admin' && order.usuario?.id !== usuario.id) {
      // 404 y no 403: así no se revela que ese pedido existe
      throw new NotFoundException('Pedido no encontrado');
    }
    return order;
  }

  findByUser(usuarioId: number) {
    return this.ordersRepo.find({
      where: { usuario: { id: usuarioId } },
      relations: { orderItems: { component: true } },
      order: { creado_en: 'DESC' },
    });
  }

  async create(usuarioId: number, dto: CreateOrderDto) {
    const usuario = await this.usuariosRepo.findOneBy({ id: usuarioId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Si el mismo producto viene repetido, se suman las cantidades
    const cantidades = new Map<number, number>();
    for (const item of dto.items) {
      cantidades.set(item.componentId, (cantidades.get(item.componentId) ?? 0) + item.cantidad);
    }

    // Todo dentro de una transacción: o se guarda el pedido completo, o no se guarda nada
    const { savedOrder, lineas, total } = await this.dataSource.transaction(async (manager) => {
      const componentes = await manager.getRepository(Component).findBy({ id: In([...cantidades.keys()]) });
      const porId = new Map(componentes.map((c) => [c.id, c]));

      const lineas = [...cantidades.entries()].map(([componentId, cantidad]) => {
        const componente = porId.get(componentId);
        if (!componente) throw new NotFoundException(`El producto ${componentId} no existe`);
        if (!componente.disponible) throw new BadRequestException(`"${componente.nombre}" no está disponible`);
        // El precio sale de la base de datos, nunca del navegador
        return { componente, cantidad, precioUnitario: Number(componente.precio) };
      });

      // Se calcula en céntimos para evitar errores de redondeo con decimales
      const totalCentimos = lineas.reduce((suma, l) => suma + Math.round(l.precioUnitario * 100) * l.cantidad, 0);
      const total = totalCentimos / 100;

      const savedOrder = await manager.getRepository(Order).save(
        manager.getRepository(Order).create({
          usuario: { id: usuarioId } as Usuario,
          total,
          estado: 'Procesando',
        }),
      );

      await manager.getRepository(OrderItem).save(
        lineas.map((l) =>
          manager.getRepository(OrderItem).create({
            order: { id: savedOrder.id } as Order,
            component: { id: l.componente.id } as Component,
            cantidad: l.cantidad,
            precio_unitario: l.precioUnitario,
          }),
        ),
      );

      // Lo comprado ya no debe volver a aparecer en el carrito
      await manager
        .getRepository(Cart)
        .createQueryBuilder()
        .delete()
        .where('usuario_id = :usuarioId', { usuarioId })
        .execute();

      return { savedOrder, lineas, total };
    });

    const orderId = formatoPedido(savedOrder.id);

    // El correo va fuera de la transacción: si falla, el pedido igual queda guardado
    this.mailService
      .sendOrderConfirmation({
        email: usuario.email,
        nombre: usuario.nombre,
        orderId,
        items: lineas.map((l) => ({
          nombre: l.componente.nombre,
          cantidad: l.cantidad,
          precio_unitario: l.precioUnitario,
        })),
        total,
        direccion: dto.direccion,
      })
      .catch((err) => this.logger.error(`Error enviando email de pedido ${orderId}: ${err}`));

    return { id: savedOrder.id, orderId, total, estado: savedOrder.estado, creado_en: savedOrder.creado_en };
  }

  async remove(id: number) {
    const result = await this.ordersRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Pedido no encontrado');
    return { deleted: true };
  }
}