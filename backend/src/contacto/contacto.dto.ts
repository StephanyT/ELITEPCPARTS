import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Antes este DTO no tenía validaciones: se aceptaba cualquier cosa
export class CreateContactoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  apellido!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  asunto!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  mensaje!: string;
}
