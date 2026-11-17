import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Cubre la normalización de FRONTEND_URL en los adaptadores de correo:
 * la URL puede venir con barras diagonales finales desde el entorno y los
 * enlaces de confirmación/restablecimiento no deben duplicarlas.
 */
describe('Enviadores de correo — normalización de FRONTEND_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('EnviadorCorreoNodemailer elimina las barras finales de FRONTEND_URL', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost:5432/db');
    vi.stubEnv('JWT_SECRET', 'secreto-de-pruebas-con-longitud-suficiente');
    vi.stubEnv('FRONTEND_URL', 'https://app.firstgig.com///');
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('SMTP_PORT', '587');
    vi.stubEnv('SMTP_USER', 'user');
    vi.stubEnv('SMTP_PASS', 'pass');
    vi.stubEnv('SMTP_FROM', 'no-reply@firstgig.com');

    const { EnviadorCorreoNodemailer } = await import('../../src/infrastructure/email/EnviadorCorreoNodemailer');
    const enviador = new EnviadorCorreoNodemailer() as unknown as {
      baseEnlaceConfirmacion: string;
      baseEnlaceRestablecimiento: string;
    };

    expect(enviador.baseEnlaceConfirmacion).toBe('https://app.firstgig.com/confirm?token=');
    expect(enviador.baseEnlaceRestablecimiento).toBe('https://app.firstgig.com/reset-password?token=');
  });

  it('EnviadorCorreoBrevo elimina las barras finales de FRONTEND_URL', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost:5432/db');
    vi.stubEnv('JWT_SECRET', 'secreto-de-pruebas-con-longitud-suficiente');
    vi.stubEnv('FRONTEND_URL', 'https://app.firstgig.com//');
    vi.stubEnv('BREVO_API_KEY', 'clave-de-prueba');

    const { EnviadorCorreoBrevo } = await import('../../src/infrastructure/email/EnviadorCorreoBrevo');
    const enviador = new EnviadorCorreoBrevo() as unknown as {
      baseEnlaceConfirmacion: string;
      baseEnlaceRestablecimiento: string;
    };

    expect(enviador.baseEnlaceConfirmacion).toBe('https://app.firstgig.com/confirm?token=');
    expect(enviador.baseEnlaceRestablecimiento).toBe('https://app.firstgig.com/reset-password?token=');
  });
});
