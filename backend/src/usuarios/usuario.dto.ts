import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

// Solo estos 3 campos se aceptan al registrarse.
// Con whitelist + forbidNonWhitelisted, mandar "id", "rol" o "verificado" da error 400.
export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72) // bcrypt ignora lo que pase de 72 bytes
  password!: string;
}