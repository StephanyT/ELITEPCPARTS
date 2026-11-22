import { BadRequestException } from '@nestjs/common';
import { EmailVerificationsService } from './email_verification.service';

const TOKEN = 'a'.repeat(64);

function crearServicio(verificacion: any) {
  const actualizados: any[] = [];
  const manager = {
    getRepository: (e: any) =>
      e.name === 'EmailVerification'
        ? { findOne: async () => verificacion, save: async (v: any) => v }
        : { update: async (id: number, d: any) => actualizados.push({ id, ...d }) },
  };
  const repo: any = { manager: { transaction: (cb: any) => cb(manager) } };
  return { service: new EmailVerificationsService(repo, {} as any), actualizados };
}

describe('EmailVerificationsService.validateToken', () => {
  it.each([undefined, '', 'abc', 'x'.repeat(64)])('rechaza un token vacío o con formato inválido: %p', async (t) => {
    const { service } = crearServicio(null);
    await expect(service.validateToken(t as any)).rejects.toThrow(BadRequestException);
  });

  it('rechaza un enlace de hace más de 24 horas', async () => {
    const hace2Dias = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const { service } = crearServicio({ token: TOKEN, usado: false, creado_en: hace2Dias, usuario: { id: 1 } });
    await expect(service.validateToken(TOKEN)).rejects.toThrow(/venció/);
  });

  it('rechaza un enlace ya usado', async () => {
    const { service } = crearServicio({ token: TOKEN, usado: true, creado_en: new Date(), usuario: { id: 1 } });
    await expect(service.validateToken(TOKEN)).rejects.toThrow(/ya fue usado/);
  });

  it('con un token válido marca la cuenta como verificada', async () => {
    const { service, actualizados } = crearServicio({ token: TOKEN, usado: false, creado_en: new Date(), usuario: { id: 4 } });
    await service.validateToken(TOKEN);
    expect(actualizados).toEqual([{ id: 4, verificado: true }]);
  });
});