import { Controller, Post, Get, Query, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsString, MaxLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './auth.decorators';

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MaxLength(72)
  password!: string;
}

export class ReenviarDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Máximo 5 intentos por minuto por IP: frena la fuerza bruta
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiBody({ schema: { example: { email: 'test@test.com', password: '12345678' } } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Get('verificar')
  verificar(@Query('token') token: string) {
    return this.authService.verificarEmail(token);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('reenviar-verificacion')
  @HttpCode(200)
  reenviar(@Body() dto: ReenviarDto) {
    return this.authService.reenviarVerificacion(dto.email);
  }
}
