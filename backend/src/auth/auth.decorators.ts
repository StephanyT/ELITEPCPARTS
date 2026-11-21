import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

// Lo que guardamos del usuario dentro del token (y en req.user)
export interface UsuarioToken {
  id: number;
  rol: Rol;
}

export type Rol = 'cliente' | 'admin';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

// Marca una ruta como abierta: no pide token.
// Todo lo que NO tenga @Public() necesita login (el guard es global).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Limita una ruta a ciertos roles, por ejemplo @Roles('admin')
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);

// Saca el usuario del token ya verificado. Así el id nunca viene del cliente.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken => {
    return ctx.switchToHttp().getRequest().user;
  },
);