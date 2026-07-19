import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  findAll() {
    return this.cartRepository.find({ relations: { usuario: true, component: true } });
  }

  findOne(id: number) {
    return this.cartRepository.findOne({ where: { id }, relations: { usuario: true, component: true } });
  }

  create(data: Partial<Cart>) {
    const item = this.cartRepository.create(data);
    return this.cartRepository.save(item);
  }

  async remove(id: number) {
    await this.cartRepository.delete(id);
    return { deleted: true };
  }
}