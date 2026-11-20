import { ConflictException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

function crearServicio(correoYaExiste = false) {
  let creado: any;
  const repo: any = {
    existsBy: async () => correoYaExiste,
    create: (d: any) => d,
    save: async (d: any) => (creado = { ...d, id: 10 }),
  };
  const verificaciones: any = { createAndSend: jest.fn().mockResolvedValue(undefined) };
  return { service: new UsuariosService(repo, verificaciones), getCreado: () => creado, verificaciones };
}

describe('UsuariosService.create', () => {
  it('responde 409 si el correo ya está registrado', async () => {
    const { service } = crearServicio(true);
    await expect(
      service.create({ nombre: 'Steph', email: 'steph@test.com', password: 'Clave12345' }),
    ).rejects.toThrow(ConflictException);
  });

  it('crea siempre un cliente sin verificar, aunque el body traiga otros campos', async () => {
    const { service, getCreado } = crearServicio();
    // Simula a alguien que intenta colar campos extra (el ValidationPipe ya los bloquea, esto es una segunda capa)
    const body: any = { nombre: 'Steph', email: 'Steph@Test.com', password: 'Clave12345', rol: 'admin', id: 1, verificado: true };
    await service.create(body);

    const u = getCreado();
    expect(u.rol).toBe('cliente');
    expect(u.verificado).toBe(false);
    expect(u.id).toBe(10); // el id lo pone la base, no el body
    expect(u.email).toBe('steph@test.com'); // se guarda en minúsculas
    expect(u.password).not.toBe('Clave12345'); // se guarda el hash
  });

  it('si falla el correo, la cuenta queda creada y no devuelve error 500', async () => {
    const { service, verificaciones } = crearServicio();
    verificaciones.createAndSend.mockRejectedValue(new Error('SMTP caído'));
    const r = await service.create({ nombre: 'Steph', email: 's@test.com', password: 'Clave12345' });
    expect(r.mensaje).toMatch(/reenviarlo/);
  });
});
