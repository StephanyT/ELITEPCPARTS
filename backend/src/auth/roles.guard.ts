import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol, ROLES_KEY, UsuarioToken } from './auth.decorators';

// Corre después del JwtAuthGuard. Si la ruta tiene @Roles('admin'),
// solo deja pasar a quien tenga ese rol en su token.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const usuario: UsuarioToken | undefined = context.switchToHttp().getRequest().user;
    if (!usuario || !roles.includes(usuario.rol)) {
      throw new ForbiddenException('No tienes permiso para hacer esto');
    }
    return true;
  }
}