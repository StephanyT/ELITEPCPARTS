import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { OrderItem } from '../order_items/order-item.entity';
import { Component } from '../components/component.entity';
import { Cart } from '../cart/cart.entity';

// Productos "en la base de datos" para las pruebas
const CATALOGO = [
  { id: 13, nombre: 'RTX 4070 Ti', precio: '2400', disponible: true },
  { id: 20, nombre: 'Ryzen 7', precio: '999.90', disponible: true },
  { id: 30, nombre: 'Agotado', precio: '100', disponible: false },
];

function crearServicio() {
  const guardados: { orden?: any; items?: any[]; carritoVaciado?: boolean } = {};

  // Simula el "manager" que TypeORM le pasa a la transacción
  const repos = new Map<unknown, any>([
    [Component, { findBy: async ({ id }: any) => CATALOGO.filter((c) => id.value.includes(c.id)) }],
    [Order, { create: (d: any) => d, save: async (d: any) => (guardados.orden = { ...d, id: 1, creado_en: new Date() }) }],
    [OrderItem, { create: (d: any) => d, save: async (d: any[]) => (guardados.items = d) }],
    [
      Cart,
      {
        createQueryBuilder: () => ({
          delete: () => ({ where: () => ({ execute: async () => (guardados.carritoVaciado = true) }) }),
        }),
      },
    ],
  ]);
  const manager = { getRepository: (entidad: unknown) => repos.get(entidad) };
  const dataSource: any = { transaction: (cb: any) => cb(manager) };

  const usuariosRepo: any = { findOneBy: async () => ({ id: 5, nombre: 'Steph', email: 's@test.com' }) };
  const mail: any = { sendOrderConfirmation: jest.fn().mockResolvedValue(undefined) };
  const ordersRepo: any = {
    findOne: async ({ where }: any) => (where.id === 1 ? { id: 1, usuario: { id: 5 }, orderItems: [] } : null),
  };

  return { service: new OrdersService(ordersRepo, usuariosRepo, dataSource, mail), guardados, mail };
}

describe('OrdersService.create', () => {
  it('calcula el total con los precios de la base de datos', async () => {
    const { service, guardados } = crearServicio();
    const r = await service.create(5, {
      items: [
        { componentId: 13, cantidad: 2 },
        { componentId: 20, cantidad: 1 },
      ],
    });

    // 2 × 2400 + 999.90 = 5799.90
    expect(r.total).toBe(5799.9);
    expect(guardados.orden.total).toBe(5799.9);
    expect(guardados.items).toEqual([
      expect.objectContaining({ cantidad: 2, precio_unitario: 2400 }),
      expect.objectContaining({ cantidad: 1, precio_unitario: 999.9 }),
    ]);
  });

  it('el pedido queda a nombre del usuario del token y vacía su carrito', async () => {
    const { service, guardados } = crearServicio();
    await service.create(5, { items: [{ componentId: 13, cantidad: 1 }] });
    expect(guardados.orden.usuario).toEqual({ id: 5 });
    expect(guardados.carritoVaciado).toBe(true);
  });

  it('si un producto viene repetido, suma las cantidades', async () => {
    const { service, guardados } = crearServicio();
    await service.create(5, {
      items: [
        { componentId: 13, cantidad: 1 },
        { componentId: 13, cantidad: 2 },
      ],
    });
    expect(guardados.items).toHaveLength(1);
    expect(guardados.items![0].cantidad).toBe(3);
  });

  it('rechaza productos que no existen (404)', async () => {
    const { service } = crearServicio();
    await expect(service.create(5, { items: [{ componentId: 999, cantidad: 1 }] })).rejects.toThrow(NotFoundException);
  });

  it('rechaza productos no disponibles (400) y no guarda nada', async () => {
    const { service, guardados } = crearServicio();
    await expect(service.create(5, { items: [{ componentId: 30, cantidad: 1 }] })).rejects.toThrow(BadRequestException);
    expect(guardados.orden).toBeUndefined();
  });
});

describe('OrdersService.findOne', () => {
  it('el dueño puede ver su pedido', async () => {
    const { service } = crearServicio();
    await expect(service.findOne({ id: 5, rol: 'cliente' }, 1)).resolves.toMatchObject({ id: 1 });
  });

  it('otro usuario recibe 404, como si el pedido no existiera', async () => {
    const { service } = crearServicio();
    await expect(service.findOne({ id: 6, rol: 'cliente' }, 1)).rejects.toThrow(NotFoundException);
  });

  it('el admin puede ver cualquier pedido', async () => {
    const { service } = crearServicio();
    await expect(service.findOne({ id: 99, rol: 'admin' }, 1)).resolves.toMatchObject({ id: 1 });
  });
});