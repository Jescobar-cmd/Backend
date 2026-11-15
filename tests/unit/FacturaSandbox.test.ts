import { describe, expect, it } from 'vitest';
import { emitirFacturaSandbox } from '../../src/domain/entities/FacturaSandbox';

describe('emitirFacturaSandbox', () => {
  it('calcula el desglose en COP y asigna un consecutivo determinista por pago', () => {
    const factura = emitirFacturaSandbox({
      pagoId: 42,
      montoServicio: 100_000,
      montoCobrado: 103_000,
      descripcion: 'Servicio freelance: Landing page',
      compradorNombre: 'Empresa Demo',
      compradorDocumento: '900123456',
      uuidDemo: '48a90626-2dc6-4af3-8d84-2dac7902cc70',
    });

    expect(factura).toEqual({
      numeroFactura: 'FGS-00000042',
      uuidDemo: '48a90626-2dc6-4af3-8d84-2dac7902cc70',
      ambiente: 'sandbox',
      moneda: 'COP',
      subtotal: 100_000,
      comisionCliente: 3_000,
      total: 103_000,
      descripcion: 'Servicio freelance: Landing page',
      compradorNombre: 'Empresa Demo',
      compradorDocumento: '900123456',
    });
  });

  it('rechaza montos inconsistentes', () => {
    expect(() => emitirFacturaSandbox({
      pagoId: 1,
      montoServicio: 100,
      montoCobrado: 99,
      descripcion: 'Servicio',
      compradorNombre: 'Cliente',
      compradorDocumento: null,
      uuidDemo: 'uuid',
    })).toThrow('Los montos del comprobante no son válidos');
  });
});
