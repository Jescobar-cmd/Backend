export type EstadoLiquidacion = 'pendiente' | 'solicitada' | 'pagada' | 'rechazada';

export interface Liquidacion {
  id: number;
  freelancerId: number;
  contratoId: number | null;
  montoBruto: number;
  comision: number;
  montoNeto: number;
  estado: EstadoLiquidacion;
  referencia: string | null;
  motivoRechazo: string | null;
  fechaCreacion: Date;
  fechaSolicitud: Date | null;
  fechaPago: Date | null;
}

export interface NuevaLiquidacion {
  freelancerId: number;
  contratoId: number;
  montoBruto: number;
  comision: number;
  montoNeto: number;
}

export interface ResumenLiquidaciones {
  saldoDisponible: number;
  saldoEnProceso: number;
  totalPagado: number;
  comisionTotal: number;
  totalLiquidaciones: number;
}

export interface ResultadoSolicitudRetiro {
  cantidad: number;
  total: number;
}

function redondearDos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** Calcula comision y neto a partir del monto bruto del contrato. */
export function calcularLiquidacion(
  montoBruto: number,
  comisionPorcentaje: number
): { comision: number; montoNeto: number } {
  const comision = redondearDos(montoBruto * (comisionPorcentaje / 100));
  return {
    comision,
    montoNeto: redondearDos(montoBruto - comision),
  };
}

/** Monto total que paga el cliente, incluyendo la comision de servicio. */
export function calcularMontoCliente(
  montoBruto: number,
  comisionClientePorcentaje: number
): number {
  return redondearDos(montoBruto * (1 + comisionClientePorcentaje / 100));
}
