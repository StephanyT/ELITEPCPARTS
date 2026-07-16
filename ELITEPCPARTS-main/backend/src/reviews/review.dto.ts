import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  calificacion!: number;

  @IsString()
  @IsOptional()
  comentario!: string;
}