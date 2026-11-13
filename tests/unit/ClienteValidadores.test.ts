import { describe, expect, it } from 'vitest';
import { registrarEntregaSchema } from '../../src/application/validators/entrega.schemas';
import { abrirDisputaSchema } from '../../src/application/validators/disputa.schemas';

describe('Validadores del flujo cliente', () => {
  it('exige al menos un dato en la entrega', () => {
    expect(registrarEntregaSchema.safeParse({}).success).toBe(false);
    expect(
      registrarEntregaSchema.safeParse({
        mensaje: 'Entrega lista',
      }).success
    ).toBe(true);
  });

  it('acepta un archivo o enlace válido en la entrega', () => {
    const resultado = registrarEntregaSchema.safeParse({
      archivoUrl: 'https://res.cloudinary.com/demo/entrega.zip',
      enlaceUrl: 'https://drive.google.com/demo',
    });

    expect(resultado.success).toBe(true);
  });

  it('rechaza un enlace de entrega que no sea http(s)', () => {
    const resultado = registrarEntregaSchema.safeParse({
      enlaceUrl: 'drive.google.com/demo',
    });

    expect(resultado.success).toBe(false);
  });

  it('valida motivo y descripción de una disputa', () => {
    expect(
      abrirDisputaSchema.safeParse({
        motivo: 'X',
        descripcion: 'Corta',
      }).success
    ).toBe(false);

    expect(
      abrirDisputaSchema.safeParse({
        motivo: 'Entrega incompleta',
        descripcion: 'Faltan dos pantallas del diseño acordado.',
      }).success
    ).toBe(true);
  });
});
