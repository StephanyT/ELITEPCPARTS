import { IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  total!: number;

  @IsString()
  estado!: string;
}