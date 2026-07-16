import { IsString, IsBoolean } from 'class-validator';

export class CreateEmailVerificationDto {
  @IsString()
  token!: string;

  @IsBoolean()
  usado!: boolean;
}