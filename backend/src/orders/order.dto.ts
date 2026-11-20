import { IsInt, IsString, IsArray, IsOptional, ValidateNested, Min, Max, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

// El cliente solo dice QUÉ quiere y CUÁNTO.
// El precio y el total los pone el servidor con los datos de la base.
export class OrderItemDto {
  @IsInt()
  @Min(1)
  componentId!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  cantidad!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(300)
  direccion?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
