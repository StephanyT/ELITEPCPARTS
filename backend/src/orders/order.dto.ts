import { IsNumber, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  componentId!: number;

  @IsNumber()
  cantidad!: number;

  @IsNumber()
  precio_unitario!: number;

  @IsString()
  @IsOptional()
  nombre?: string;
}

export class CreateOrderDto {
  @IsNumber()
  usuarioId!: number;

  @IsNumber()
  total!: number;

  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
