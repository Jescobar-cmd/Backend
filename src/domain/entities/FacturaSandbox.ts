/**
 * Reglas puras del comprobante académico. Este documento no es una factura
 * electrónica DIAN: no contiene CUFE ni se transmite a una autoridad fiscal.
 */
export interface DatosFacturaSandbox {
  pagoId: number;
  montoServicio: number;
  montoCobrado: number;
  descripcion: string;
  compradorNombre: string;
  compradorDocumento: string | null;
  uuidDemo: string;
}

export interface FacturaSandboxEmitida {
  numeroFactura: string;
  uuidDemo: string;
  ambiente: 'sandbox';
  moneda: 'COP';
  subtotal: number;
  comisionCliente: number;
  total: number;
  descripcion: string;
  compradorNombre: string;
  compradorDocumento: string | null;
}

function redondearDos(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/** Construye un comprobante determinista por pago, apto para persistirse una sola vez. */
export function emitirFacturaSandbox(
  datos: DatosFacturaSandbox
): FacturaSandboxEmitida {
  if (!Number.isInteger(datos.pagoId) || datos.pagoId <= 0) {
    throw new Error('El pago debe tener un identificador válido');
  }
  if (datos.montoServicio < 0 || datos.montoCobrado < datos.montoServicio) {
    throw new Error('Los montos del comprobante no son válidos');
  }

  return {
    numeroFactura: `FGS-${String(datos.pagoId).padStart(8, '0')}`,
    uuidDemo: datos.uuidDemo,
    ambiente: 'sandbox',
    moneda: 'COP',
    subtotal: redondearDos(datos.montoServicio),
    comisionCliente: redondearDos(datos.montoCobrado - datos.montoServicio),
    total: redondearDos(datos.montoCobrado),
    descripcion: datos.descripcion,
    compradorNombre: datos.compradorNombre,
    compradorDocumento: datos.compradorDocumento,
  };
}
