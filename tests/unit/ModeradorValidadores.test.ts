import { describe, expect, it } from 'vitest';
import {
  consultaLiquidacionesSchema,
  consultaReportesSchema,
  resolverReporteSchema,
  resolverRetiroSchema,
} from '../../src/application/validators/moderador.schemas';
import { crearReporteSchema } from '../../src/application/validators/reporte.schemas';

describe('Validadores del moderador', () => {
  it('resolverReporteSchema aplica estado resuelto por defecto', () => {
    const resultado = resolverReporteSchema.parse({ resolucion: 'Advertencia aplicada' });
    expect(resultado.estado).toBe('resuelto');
  });

  it('resolverReporteSchema permite rechazar y valida la resolución', () => {
    expect(
      resolverReporteSchema.parse({ resolucion: 'Sin mérito', estado: 'rechazado' }).estado
    ).toBe('rechazado');
    expect(() => resolverReporteSchema.parse({ resolucion: 'ab' })).toThrow();
    expect(() =>
      resolverReporteSchema.parse({ resolucion: 'Advertencia', estado: 'pendiente' })
    ).toThrow();
  });

  it('resolverRetiroSchema aplica pagada por defecto y permite rechazar con motivo', () => {
    expect(resolverRetiroSchema.parse({}).estado).toBe('pagada');
    expect(
      resolverRetiroSchema.parse({
        estado: 'rechazada',
        motivoRechazo: 'Cuenta inválida',
      }).estado
    ).toBe('rechazada');
    expect(() =>
      resolverRetiroSchema.parse({ estado: 'rechazada' })
    ).toThrow();
    expect(() => resolverRetiroSchema.parse({ estado: 'pendiente' })).toThrow();
  });

  it('consultaLiquidacionesSchema acepta el estado rechazada', () => {
    expect(consultaLiquidacionesSchema.parse({ estado: 'rechazada' }).estado).toBe('rechazada');
    expect(() => consultaLiquidacionesSchema.parse({ estado: 'cancelada' })).toThrow();
  });

  it('consultaReportesSchema aplica paginación por defecto y acota el máximo', () => {
    expect(consultaReportesSchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(() => consultaReportesSchema.parse({ limit: 51 })).toThrow();
    expect(() => consultaReportesSchema.parse({ campo: 'x' })).toThrow();
  });
});

describe('crearReporteSchema', () => {
  it('acepta ids numéricos o strings numéricos', () => {
    const resultado = crearReporteSchema.parse({
      usuarioReportadoId: '8',
      motivo: 'Spam',
    });
    expect(resultado.usuarioReportadoId).toBe(8);
  });

  it('exige al menos un usuario o un proyecto', () => {
    expect(() => crearReporteSchema.parse({ motivo: 'Spam' })).toThrow();
  });

  it('valida motivo, descripción y claves desconocidas', () => {
    expect(() =>
      crearReporteSchema.parse({ usuarioReportadoId: 8, motivo: 'ab' })
    ).toThrow();
    expect(() =>
      crearReporteSchema.parse({
        usuarioReportadoId: 8,
        motivo: 'Spam',
        descripcion: 'x'.repeat(1001),
      })
    ).toThrow();
    expect(() =>
      crearReporteSchema.parse({ usuarioReportadoId: 8, motivo: 'Spam', extra: true })
    ).toThrow();
  });
});
