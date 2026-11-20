import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.decorators';

// Arma un ExecutionContext falso con los headers y la metadata que queramos
function contexto(headers: Record<string, string> = {}, metadata: Record<string, unknown> = {}, user?: unknown) {
  const request: any = { headers, user };
  const handler = () => undefined;
  Object.entries(metadata).forEach(([k, v]) => Reflect.defineMetadata(k, v, handler));
  const ctx = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => class {},
  } as unknown as ExecutionContext;
  return { ctx, request };
}

describe('JwtAuthGuard', () => {
  const jwt = new JwtService({ secret: 'clave-de-prueba', signOptions: { expiresIn: '1h' } });
  const guard = new JwtAuthGuard(jwt, new Reflector());

  it('deja pasar las rutas @Public() sin token', async () => {
    const { ctx } = contexto({}, { [IS_PUBLIC_KEY]: true });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('responde 401 si no hay token', async () => {
    const { ctx } = contexto();
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('acepta un token válido y deja el usuario en req.user', async () => {
    const token = await jwt.signAsync({ sub: 7, rol: 'cliente' });
    const { ctx, request } = contexto({ authorization: `Bearer ${token}` });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 7, rol: 'cliente' });
  });

  it('rechaza un token modificado (alguien se cambió el rol a admin)', async () => {
    const token = await jwt.signAsync({ sub: 7, rol: 'cliente' });
    const [h, payload, firma] = token.split('.');
    const datos = JSON.parse(Buffer.from(payload, 'base64url').toString());
    datos.rol = 'admin';
    const falso = [h, Buffer.from(JSON.stringify(datos)).toString('base64url'), firma].join('.');

    const { ctx } = contexto({ authorization: `Bearer ${falso}` });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token firmado con otra clave', async () => {
    const otro = new JwtService({ secret: 'otra-clave' });
    const token = await otro.signAsync({ sub: 1, rol: 'admin' });
    const { ctx } = contexto({ authorization: `Bearer ${token}` });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('deja pasar si la ruta no pide rol', () => {
    const { ctx } = contexto({}, {}, { id: 1, rol: 'cliente' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('deja pasar al admin en una ruta @Roles("admin")', () => {
    const { ctx } = contexto({}, { [ROLES_KEY]: ['admin'] }, { id: 1, rol: 'admin' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('bloquea con 403 a un cliente en una ruta @Roles("admin")', () => {
    const { ctx } = contexto({}, { [ROLES_KEY]: ['admin'] }, { id: 2, rol: 'cliente' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
