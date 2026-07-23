import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  findByUser(usuarioId: number) {
    return this.wishlistRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: { component: true },
      order: { creado_en: 'DESC' },
    });
  }

  async add(usuarioId: number, componentId: number) {
    const existing = await this.wishlistRepository.findOne({
      where: { usuario: { id: usuarioId }, component: { id: componentId } },
    });
    if (existing) throw new ConflictException('Ya está en tu lista de deseos');
    const item = this.wishlistRepository.create({
      usuario: { id: usuarioId } as any,
      component: { id: componentId } as any,
    });
    return this.wishlistRepository.save(item);
  }

  async remove(id: number) {
    await this.wishlistRepository.delete(id);
    return { deleted: true };
  }
}
