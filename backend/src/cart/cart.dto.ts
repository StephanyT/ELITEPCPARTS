import { IsInt, Min } from 'class-validator';

export class CreateCartDto {
  @IsInt()
  component_id!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class UpdateCartDto {
  @IsInt()
  @Min(1)
  cantidad!: number;
}
