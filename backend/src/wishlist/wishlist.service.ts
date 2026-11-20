import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Component } from '../components/component.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Component)
    private componentsRepository: Repository<Component>,
  ) {}

  findByUser(usuarioId: number) {
    return this.wishlistRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: { component: true },
      order: { creado_en: 'DESC' },
    });
  }

  async add(usuarioId: number, componentId: number) {
    if (!(await this.componentsRepository.existsBy({ id: componentId }))) {
      throw new NotFoundException('Componente no encontrado');
    }

    const existing = await this.wishlistRepository.findOne({
      where: { usuario: { id: usuarioId }, component: { id: componentId } },
    });
    if (existing) throw new ConflictException('Ya está en tu lista de deseos');

    const item = this.wishlistRepository.create({
      usuario: { id: usuarioId } as Usuario,
      component: { id: componentId } as Component,
    });
    return this.wishlistRepository.save(item);
  }

  // Solo borra si el ítem es del usuario del token
  async remove(usuarioId: number, id: number) {
    const result = await this.wishlistRepository.delete({ id, usuario: { id: usuarioId } });
    if (!result.affected) throw new NotFoundException('Ítem no encontrado en tu lista');
    return { deleted: true };
  }
}
