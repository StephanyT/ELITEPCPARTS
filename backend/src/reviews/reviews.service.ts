import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './review.dto';
import { Component } from '../components/component.entity';
import { Usuario } from '../usuarios/usuario.entity';
import type { UsuarioToken } from '../auth/auth.decorators';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Component)
    private componentsRepository: Repository<Component>,
  ) {}

  findAll() {
    return this.reviewsRepository.find({ relations: { usuario: true, component: true } });
  }

  // Público: solo devuelve el nombre del autor, no su correo
  findByComponent(componentId: number) {
    return this.reviewsRepository.find({
      where: { component: { id: componentId } },
      relations: { usuario: true },
      select: {
        id: true,
        calificacion: true,
        comentario: true,
        creado_en: true,
        usuario: { id: true, nombre: true },
      },
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

  async create(usuarioId: number, dto: CreateReviewDto) {
    if (!(await this.componentsRepository.existsBy({ id: dto.componentId }))) {
      throw new NotFoundException('Componente no encontrado');
    }

    const yaExiste = await this.reviewsRepository.existsBy({
      usuario: { id: usuarioId },
      component: { id: dto.componentId },
    });
    if (yaExiste) throw new ConflictException('Ya dejaste una reseña para este producto');

    const review = this.reviewsRepository.create({
      calificacion: dto.calificacion,
      comentario: dto.comentario?.trim() || undefined,
      usuario: { id: usuarioId } as Usuario,
      component: { id: dto.componentId } as Component,
    });
    return this.reviewsRepository.save(review);
  }

  // El autor puede borrar su reseña; el admin puede borrar cualquiera
  async remove(usuario: UsuarioToken, id: number) {
    const review = await this.reviewsRepository.findOne({ where: { id }, relations: { usuario: true } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (usuario.rol !== 'admin' && review.usuario?.id !== usuario.id) {
      throw new ForbiddenException('Solo puedes borrar tus propias reseñas');
    }
    await this.reviewsRepository.delete(id);
    return { deleted: true };
  }
}