import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

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

  create(data: Partial<Review>) {
    const review = this.reviewsRepository.create(data);
    return this.reviewsRepository.save(review);
  }

  async remove(id: number) {
    await this.reviewsRepository.delete(id);
    return { deleted: true };
  }
}