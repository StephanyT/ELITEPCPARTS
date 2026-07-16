import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  findAll() {
    return this.ordersRepository.find({ relations: { usuario: true } });
  }

  findOne(id: number) {
    return this.ordersRepository.findOne({ where: { id }, relations: { usuario: true } });
  }

  create(data: Partial<Order>) {
    const order = this.ordersRepository.create(data);
    return this.ordersRepository.save(order);
  }

  async remove(id: number) {
    await this.ordersRepository.delete(id);
    return { deleted: true };
  }
}