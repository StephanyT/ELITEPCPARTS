import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Component } from './component.entity';
import { CreateComponentDto } from './component.dto';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectRepository(Component)
    private componentsRepository: Repository<Component>,
  ) {}

  findAll() {
    return this.componentsRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const component = await this.componentsRepository.findOneBy({ id });
    if (!component) throw new NotFoundException('Componente no encontrado');
    return component;
  }

  create(dto: CreateComponentDto) {
    const component = this.componentsRepository.create({
      nombre: dto.nombre,
      categoria: dto.categoria,
      precio: dto.precio,
      imagen_url: dto.imagen_url,
      disponible: dto.disponible ?? true,
    });
    return this.componentsRepository.save(component);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.componentsRepository.delete(id);
    return { deleted: true };
  }
}
