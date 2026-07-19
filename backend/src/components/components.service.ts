import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Component } from './component.entity';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectRepository(Component)
    private componentsRepository: Repository<Component>,
  ) {}

  findAll() {
    return this.componentsRepository.find();
  }

  findOne(id: number) {
    return this.componentsRepository.findOneBy({ id });
  }

  create(data: Partial<Component>) {
    const component = this.componentsRepository.create(data);
    return this.componentsRepository.save(component);
  }

  async remove(id: number) {
    await this.componentsRepository.delete(id);
    return { deleted: true };
  }
}