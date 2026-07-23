import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  findAll() {
    return this.reviewsRepository.find({ relations: { usuario: true, component: true } });
  }

  findOne(id: number) {
    return this.reviewsRepository.findOne({ where: { id }, relations: { usuario: true, component: true } });
  }

  findByComponent(componentId: number) {
    return this.reviewsRepository.find({
      where: { component: { id: componentId } },
      relations: { usuario: true },
      order: { creado_en: 'DESC' },
    });
  }

  findByUser(usuarioId: number) {
    return this.reviewsRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: { component: true },
      order: { creado_en: 'DESC' },
    });
  }

  async create(dto: CreateReviewDto) {
    const review = this.reviewsRepository.create({
      calificacion: dto.calificacion,
      comentario: dto.comentario,
      usuario: { id: dto.usuarioId } as any,
      component: { id: dto.componentId } as any,
    });
    return this.reviewsRepository.save(review);
  }

  async remove(id: number) {
    await this.reviewsRepository.delete(id);
    return { deleted: true };
  }
}
