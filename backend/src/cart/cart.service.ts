import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Component } from '../components/component.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Component)
    private componentsRepository: Repository<Component>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async findByUsuario(usuarioId: number) {
    await this.ensureUsuarioExists(usuarioId);

    return this.cartRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: { usuario: true, component: true },
    });
  }

  async agregar(usuarioId: number, componentId: number, cantidad: number) {
    this.ensureCantidadValida(cantidad);
    await this.ensureUsuarioExists(usuarioId);

    const component = await this.componentsRepository.findOneBy({ id: componentId });
    if (!component) {
      throw new NotFoundException('Componente no encontrado');
    }
    if (!component.disponible) {
      throw new BadRequestException('El componente no está disponible');
    }

    const existente = await this.cartRepository.findOne({
      where: { usuario: { id: usuarioId }, component: { id: componentId } },
      relations: { usuario: true, component: true },
    });

    if (existente) {
      existente.cantidad += cantidad;
      return this.cartRepository.save(existente);
    }

    const item = this.cartRepository.create({
      usuario: { id: usuarioId } as Usuario,
      component: { id: componentId } as Component,
      cantidad,
    });

    return this.cartRepository.save(item);
  }

  async actualizarCantidad(usuarioId: number, id: number, cantidad: number) {
    this.ensureCantidadValida(cantidad);

    const item = await this.cartRepository.findOne({
      where: { id, usuario: { id: usuarioId } },
      relations: { usuario: true, component: true },
    });

    if (!item) {
      throw new NotFoundException('Ítem del carrito no encontrado');
    }

    item.cantidad = cantidad;
    return this.cartRepository.save(item);
  }

  async removeItem(usuarioId: number, id: number) {
    const item = await this.cartRepository.findOne({
      where: { id, usuario: { id: usuarioId } },
    });

    if (!item) {
      throw new NotFoundException('Ítem del carrito no encontrado');
    }

    await this.cartRepository.delete(id);
    return { deleted: true };
  }

  async vaciar(usuarioId: number) {
    await this.ensureUsuarioExists(usuarioId);

    await this.cartRepository
      .createQueryBuilder()
      .delete()
      .where('usuario_id = :usuarioId', { usuarioId })
      .execute();

    return { deleted: true };
  }

  private ensureCantidadValida(cantidad: number) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }
  }

  private async ensureUsuarioExists(usuarioId: number) {
    const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
