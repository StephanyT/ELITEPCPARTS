import { IsString, IsNumber, IsBoolean, IsNotEmpty, MaxLength, Min, IsOptional } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  categoria!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio!: number;

  @IsString()
  @MaxLength(500)
  imagen_url!: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}