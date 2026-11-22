import { IsInt, Min } from 'class-validator';

// El usuario ya no viene en el body: sale del token
export class CreateWishlistDto {
  @IsInt()
  @Min(1)
  componentId!: number;
}