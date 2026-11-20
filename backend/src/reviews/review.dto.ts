import { IsInt, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';

// El usuario ya no viene en el body: sale del token
export class CreateReviewDto {
  @IsInt()
  @Min(1)
  componentId!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  calificacion!: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comentario?: string;
}
