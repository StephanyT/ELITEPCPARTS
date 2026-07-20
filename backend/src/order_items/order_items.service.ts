import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

  findAll() {
    return this.orderItemsRepository.find({ relations: { order: true, component: true } });
  }

  findOne(id: number) {
    return this.orderItemsRepository.findOne({ where: { id }, relations: { order: true, component: true } });
  }

  create(data: Partial<OrderItem>) {
    const item = this.orderItemsRepository.create(data);
    return this.orderItemsRepository.save(item);
  }

  async remove(id: number) {
    await this.orderItemsRepository.delete(id);
    return { deleted: true };
  }
}