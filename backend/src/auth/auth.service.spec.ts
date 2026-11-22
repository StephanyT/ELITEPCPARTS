import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService.login', () => {
  const jwt = new JwtService({ secret: 'clave-de-prueba', signOptions: { expiresIn: '1h' } });
  let usuarioEnBD: any;

  // Simula el queryBuilder de TypeORM que usa login()
  const repo: any = {
    createQueryBuilder: () => ({
      addSelect: () => ({ where: () => ({ getOne: async () => usuarioEnBD }) }),
    }),
  };
  const service = new AuthService(repo, {} as any, jwt);

  beforeAll(async () => {
    usuarioEnBD = {
      id: 3,
      nombre: 'Steph',
      email: 'steph@test.com',
      password: await bcrypt.hash('Clave12345', 4),
      verificado: true,
      rol: 'cliente',
    };
  });

  it('rechaza una contraseña incorrecta con 401', async () => {
    await expect(service.login('steph@test.com', 'mala')).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un correo que no existe con el mismo 401 (no revela si existe)', async () => {
    const guardado = usuarioEnBD;
    usuarioEnBD = null;
    await expect(service.login('nadie@test.com', 'Clave12345')).rejects.toThrow(UnauthorizedException);
    usuarioEnBD = guardado;
  });

  it('no deja entrar a una cuenta sin verificar (403)', async () => {
    usuarioEnBD.verificado = false;
    await expect(service.login('steph@test.com', 'Clave12345')).rejects.toThrow(ForbiddenException);
    usuarioEnBD.verificado = true;
  });

  it('con datos correctos devuelve un token con el id y el rol, y nunca la contraseña', async () => {
    const r = await service.login('steph@test.com', 'Clave12345');
    expect(r.usuario).toEqual({ id: 3, nombre: 'Steph', email: 'steph@test.com', rol: 'cliente' });
    expect(JSON.stringify(r)).not.toContain('password');

    const payload = await jwt.verifyAsync(r.token);
    expect(payload).toMatchObject({ sub: 3, rol: 'cliente' });
  });
});

describe('AuthService.reenviarVerificacion', () => {
  const MENSAJE = 'Si el correo está registrado y no fue verificado, te enviamos un nuevo enlace.';

  function armar(usuario: any, createAndSend: jest.Mock) {
    const repo: any = { findOneBy: async () => usuario };
    return new AuthService(repo, { createAndSend } as any, {} as any);
  }

  it('responde lo mismo si el correo no existe (no revela qué cuentas hay)', async () => {
    const enviar = jest.fn();
    const r = await armar(null, enviar).reenviarVerificacion('nadie@test.com');
    expect(r.mensaje).toBe(MENSAJE);
    expect(enviar).not.toHaveBeenCalled();
  });

  it('no manda correo a una cuenta ya verificada', async () => {
    const enviar = jest.fn();
    await armar({ id: 1, verificado: true }, enviar).reenviarVerificacion('a@test.com');
    expect(enviar).not.toHaveBeenCalled();
  });

  it('si el correo falla no responde 500: devuelve el mismo mensaje', async () => {
    const enviar = jest.fn().mockRejectedValue(new Error('SMTP caído'));
    const r = await armar({ id: 2, verificado: false }, enviar).reenviarVerificacion('b@test.com');
    expect(enviar).toHaveBeenCalled();
    expect(r.mensaje).toBe(MENSAJE);
  });
});