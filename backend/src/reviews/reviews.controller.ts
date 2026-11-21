import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './review.dto';
import { CurrentUser, Public, Roles } from '../auth/auth.decorators';
import type { UsuarioToken } from '../auth/auth.decorators';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Todas las reseñas de la tienda: solo admin
  @Roles('admin')
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  // Las reseñas de un producto las puede ver cualquiera, aunque no tenga cuenta
  @Public()
  @Get('component/:componentId')
  findByComponent(@Param('componentId', ParseIntPipe) componentId: number) {
    return this.reviewsService.findByComponent(componentId);
  }

  // Mis reseñas (antes era /reviews/usuario/:id)
  @Get('mine')
  findMine(@CurrentUser() usuario: UsuarioToken) {
    return this.reviewsService.findByUser(usuario.id);
  }

  @Post()
  create(@CurrentUser() usuario: UsuarioToken, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(usuario.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(usuario, id);
  }
}