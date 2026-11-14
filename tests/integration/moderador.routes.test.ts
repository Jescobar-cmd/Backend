import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import jwt from 'jsonwebtoken';

let servidor: http.Server;
let baseUrl: string;
let secreto: string;

function token(rol: number): string {
  return jwt.sign(
    { id: 1, email: 'prueba@firstgig.com', rol },
    secreto,
    { expiresIn: '1h' }
  );
}

async function peticion(
  ruta: string,
  opciones: RequestInit = {}
): Promise<Response> {
  return fetch(`${baseUrl}${ruta}`, opciones);
}

beforeAll(async () => {
  process.env.DATABASE_URL ??= 'postgresql://usuario:clave@localhost:5432/firstgig_test';
  process.env.JWT_SECRET ??= 'secreto-de-pruebas-con-longitud-suficiente';
  process.env.NODE_ENV = 'test';

  const { createApp } = await import('../../src/infrastructure/http/app');
  secreto = process.env.JWT_SECRET as string;

  servidor = createApp().listen(0);
  await new Promise<void>((resolver) => servidor.once('listening', () => resolver()));
  const { port } = servidor.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolver) => servidor.close(() => resolver()));
});

describe('Rutas HTTP del moderador y reportes', () => {
  it('expone /health sin autenticación', async () => {
    const respuesta = await peticion('/health');
    expect(respuesta.status).toBe(200);
  });

  it('publica Swagger con las rutas de reportes y moderación', async () => {
    const respuesta = await peticion('/api-docs.json');
    expect(respuesta.status).toBe(200);
    const docs = (await respuesta.json()) as { paths: Record<string, unknown> };
    expect(docs.paths['/api/reportes']).toBeDefined();
    expect(docs.paths['/api/moderador/reportes']).toBeDefined();
    expect(docs.paths['/api/moderador/liquidaciones/{id}/pagar']).toBeDefined();
  });

  it('protege /api/moderador con 401 sin token', async () => {
    const respuesta = await peticion('/api/moderador/dashboard');
    expect(respuesta.status).toBe(401);
  });

  it('devuelve 403 si el rol no es admin ni moderador', async () => {
    const respuesta = await peticion('/api/moderador/dashboard', {
      headers: { Authorization: `Bearer ${token(3)}` },
    });
    expect(respuesta.status).toBe(403);
  });

  it('devuelve 400 con un id malformado antes de tocar la base de datos', async () => {
    const respuesta = await peticion('/api/moderador/reportes/abc', {
      headers: { Authorization: `Bearer ${token(4)}` },
    });
    expect(respuesta.status).toBe(400);
    const cuerpo = (await respuesta.json()) as { error: string };
    expect(cuerpo.error).toContain('reporte');
  });

  it('valida el cuerpo de POST /api/reportes con 422', async () => {
    const respuesta = await peticion('/api/reportes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token(3)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ motivo: 'ab' }),
    });
    expect(respuesta.status).toBe(422);
  });

  it('exige autenticación para crear reportes', async () => {
    const respuesta = await peticion('/api/reportes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioReportadoId: 8, motivo: 'Spam' }),
    });
    expect(respuesta.status).toBe(401);
  });
});
