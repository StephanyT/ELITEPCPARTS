import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './cart.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Component } from '../components/component.entity';
import { CreateCartDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(Component)
    private componentRepository: Repository<Component>,
  ) {}

  findAll() {
    return this.cartRepository.find({
      relations: {
        usuario: true,
        component: true,
      },
    });
  }

  findOne(id: number) {
    return this.cartRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        component: true,
      },
    });
  }

  async create(createCartDto: CreateCartDto) {
    const { usuarioId, componentId, cantidad } = createCartDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const component = await this.componentRepository.findOne({
      where: { id: componentId },
    });

    if (!component) {
      throw new NotFoundException('Componente no encontrado');
    }

    const item = this.cartRepository.create({
      usuario,
      component,
      cantidad,
    });

    return this.cartRepository.save(item);
  }

  async remove(id: number) {
    await this.cartRepository.delete(id);
    return {
      deleted: true,
    };
  }
}
