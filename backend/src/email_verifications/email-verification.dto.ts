import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateEmailVerificationDto {
  @IsNumber()
  usuario_id!: number;

  @IsString()
  token!: string;

  @IsBoolean()
  @IsOptional()
  usado?: boolean;
}
