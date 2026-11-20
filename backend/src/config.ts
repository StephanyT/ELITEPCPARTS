// Lee una variable de entorno obligatoria.
// Si falta, la app no arranca: es mejor fallar al inicio que correr con una clave inventada.
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu archivo .env (hay un ejemplo en .env.example).`);
  }
  return value;
}

export const isProduction = () => process.env.NODE_ENV === 'production';

// Escapa texto antes de meterlo en HTML (correos). Evita que alguien inyecte etiquetas.
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
