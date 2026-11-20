import { IsInt, Max, Min } from 'class-validator';

export class CreateCartDto {
  @IsInt()
  @Min(1)
  component_id!: number;

  @IsInt()
  @Min(1)
  @Max(99)
  cantidad!: number;
}

export class UpdateCartDto {
  @IsInt()
  @Min(1)
  @Max(99)
  cantidad!: number;
}
