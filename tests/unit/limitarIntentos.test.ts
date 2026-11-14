import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { limitarIntentos } from '../../src/infrastructure/http/middlewares/limitarIntentos';
import { ErrorDemasiadasSolicitudes } from '../../src/shared/errors/ErrorAplicacion';

function solicitud(): Request {
  return {
    ip: '127.0.0.1',
    method: 'POST',
    baseUrl: '/api/auth',
    path: '/login',
  } as Request;
}

describe('limitarIntentos', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('permite los intentos dentro del límite y bloquea el exceso', () => {
    const middleware = limitarIntentos({ ventanaMs: 60_000, maximo: 2 });
    const next = vi.fn();
    const siguiente = next as unknown as NextFunction;

    middleware(solicitud(), {} as Response, siguiente);
    middleware(solicitud(), {} as Response, siguiente);
    middleware(solicitud(), {} as Response, siguiente);

    expect(next).toHaveBeenCalledTimes(3);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();
    expect(next.mock.calls[2]?.[0]).toBeInstanceOf(ErrorDemasiadasSolicitudes);
  });

  it('reinicia el conteo al pasar la ventana', () => {
    const middleware = limitarIntentos({ ventanaMs: 60_000, maximo: 1 });
    const next = vi.fn();
    const siguiente = next as unknown as NextFunction;

    middleware(solicitud(), {} as Response, siguiente);
    middleware(solicitud(), {} as Response, siguiente);
    expect(next.mock.calls[1]?.[0]).toBeInstanceOf(ErrorDemasiadasSolicitudes);

    vi.setSystemTime(new Date('2026-01-01T00:02:00.000Z'));
    middleware(solicitud(), {} as Response, siguiente);
    expect(next.mock.calls[2]?.[0]).toBeUndefined();
  });
});
