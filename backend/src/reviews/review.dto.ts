import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  usuarioId!: number;

  @IsNumber()
  componentId!: number;

  @IsNumber()
  calificacion!: number;

  @IsString()
  @IsOptional()
  comentario?: string;
}
