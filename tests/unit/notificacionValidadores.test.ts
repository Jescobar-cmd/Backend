import { describe, expect, it } from 'vitest';
import { consultaNotificacionesSchema } from '../../src/application/validators/notificacion.schemas';

describe('consultaNotificacionesSchema', () => {
  it('aplica valores por defecto cuando no se envían parámetros', () => {
    const parseado = consultaNotificacionesSchema.parse({});
    expect(parseado).toEqual({
      page: 1,
      limit: 20,
      soloNoLeidas: false,
    });
  });

  it('castea correctamente strings numéricos y booleanos de query params', () => {
    const parseado = consultaNotificacionesSchema.parse({
      page: '3',
      limit: '15',
      soloNoLeidas: 'true',
    });
    expect(parseado).toEqual({
      page: 3,
      limit: 15,
      soloNoLeidas: true,
    });
  });

  it('rechaza valores fuera de rango para el límite', () => {
    expect(() =>
      consultaNotificacionesSchema.parse({
        limit: 100,
      })
    ).toThrow();
  });
});
