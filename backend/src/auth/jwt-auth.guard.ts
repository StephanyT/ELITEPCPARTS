import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, UsuarioToken } from './auth.decorators';

// Guard global: revisa el header "Authorization: Bearer <token>" en cada petición.
// Si la ruta tiene @Public() lo deja pasar sin token.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const [tipo, token] = (request.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Necesitas iniciar sesión');
    }

    try {
      // verifyAsync revisa la firma y la fecha de vencimiento
      const payload = await this.jwtService.verifyAsync<{ sub: number; rol: UsuarioToken['rol'] }>(token);
      const usuario: UsuarioToken = { id: payload.sub, rol: payload.rol };
      request.user = usuario;
      return true;
    } catch {
      throw new UnauthorizedException('Tu sesión expiró o no es válida');
    }
  }
}