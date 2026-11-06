import { describe, expect, it } from 'vitest';
import {
  parsearIdParam,
  obtenerUsuarioId,
  obtenerUsuarioSesion,
  parsearPaginacion,
  parsearEnteroOpcional,
} from '../../src/infrastructure/http/helpers/peticion.helper';
import { SolicitudAutenticada } from '../../src/infrastructure/http/middlewares/middlewareAutenticacion';
import { ErrorNoAutorizado, ErrorSolicitudInvalida } from '../../src/shared/errors/ErrorAplicacion';

describe('peticion.helper', () => {
  describe('parsearIdParam', () => {
    it('retorna el número cuando es un entero positivo válido', () => {
      expect(parsearIdParam('42', 'recurso')).toBe(42);
      expect(parsearIdParam(10, 'oferta')).toBe(10);
    });

    it('lanza ErrorSolicitudInvalida si es menor o igual a cero', () => {
      expect(() => parsearIdParam('0', 'oferta')).toThrow(ErrorSolicitudInvalida);
      expect(() => parsearIdParam('-5', 'oferta')).toThrow(ErrorSolicitudInvalida);
    });

    it('lanza ErrorSolicitudInvalida si no es un número entero', () => {
      expect(() => parsearIdParam('abc', 'oferta')).toThrow(ErrorSolicitudInvalida);
      expect(() => parsearIdParam('3.14', 'oferta')).toThrow(ErrorSolicitudInvalida);
    });

    it('formatea adecuadamente el mensaje de error según la etiqueta', () => {
      expect(() => parsearIdParam('invalido', 'la propuesta')).toThrow(
        'El id de la propuesta no es válido'
      );
      expect(() => parsearIdParam('invalido', 'contrato')).toThrow(
        'El id del contrato no es válido'
      );
    });
  });

  describe('obtenerUsuarioId', () => {
    it('retorna el id cuando el usuario está autenticado', () => {
      const req = { usuario: { id: 15, email: 'user@test.com', rol: 1 } } as SolicitudAutenticada;
      expect(obtenerUsuarioId(req)).toBe(15);
    });

    it('lanza ErrorNoAutorizado si req.usuario es undefined o falta id', () => {
      const req1 = {} as SolicitudAutenticada;
      expect(() => obtenerUsuarioId(req1)).toThrow(ErrorNoAutorizado);

      const req2 = { usuario: {} } as SolicitudAutenticada;
      expect(() => obtenerUsuarioId(req2)).toThrow(ErrorNoAutorizado);
    });
  });

  describe('obtenerUsuarioSesion', () => {
    it('retorna el id, rol y email completos de la sesión', () => {
      const req = { usuario: { id: 12, email: 'test@mail.com', rol: 2 } } as SolicitudAutenticada;
      const sesion = obtenerUsuarioSesion(req);
      expect(sesion).toEqual({ id: 12, rol: 2, email: 'test@mail.com' });
    });

    it('lanza ErrorNoAutorizado si rol es undefined', () => {
      const req = { usuario: { id: 12, email: 'test@mail.com' } } as unknown as SolicitudAutenticada;
      expect(() => obtenerUsuarioSesion(req)).toThrow(ErrorNoAutorizado);
    });
  });

  describe('parsearPaginacion', () => {
    it('aplica defaults si no se proveen valores', () => {
      const pag = parsearPaginacion({});
      expect(pag).toEqual({ page: 1, limit: 10 });
    });

    it('respeta límites configurados y no excede maxLimit', () => {
      const pag = parsearPaginacion({ page: '3', limit: '100' }, { maxLimit: 25 });
      expect(pag).toEqual({ page: 3, limit: 25 });
    });

    it('fuerza page a mínimo 1 ante valores negativos o inválidos', () => {
      const pag = parsearPaginacion({ page: '-2', limit: '0' });
      expect(pag.page).toBe(1);
      expect(pag.limit).toBe(10);
    });
  });

  describe('parsearEnteroOpcional', () => {
    it('retorna undefined ante cadenas vacías o undefined', () => {
      expect(parsearEnteroOpcional(undefined, 'campo')).toBeUndefined();
      expect(parsearEnteroOpcional('', 'campo')).toBeUndefined();
      expect(parsearEnteroOpcional(null, 'campo')).toBeUndefined();
    });

    it('retorna el número cuando es entero positivo', () => {
      expect(parsearEnteroOpcional('8', 'campo')).toBe(8);
    });

    it('lanza ErrorSolicitudInvalida si no es positivo o entero', () => {
      expect(() => parsearEnteroOpcional('0', 'filtroId')).toThrow(ErrorSolicitudInvalida);
      expect(() => parsearEnteroOpcional('xyz', 'filtroId')).toThrow(ErrorSolicitudInvalida);
    });
  });
});
