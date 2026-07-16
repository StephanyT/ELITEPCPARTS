import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  nombre!: string;

  @IsString()
  categoria!: string;

  @IsNumber()
  precio!: number;

  @IsString()
  imagen_url!: string;

  @IsBoolean()
  disponible!: boolean;
}