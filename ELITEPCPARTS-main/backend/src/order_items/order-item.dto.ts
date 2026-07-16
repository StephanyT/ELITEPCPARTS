import { IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  cantidad!: number;

  @IsNumber()
  precio_unitario!: number;
}