export interface FacturaCliente {
  id: number;
  numeroFactura: string | null;
  cufe: string | null;
  fechaEmision: Date | null;
  estado: string;
  urlPdf: string | null;
}

export interface PagoCliente {
  id: number;
  contratoId: number;
  /** Monto total cobrado al cliente, incluyendo la comision de servicio. */
  monto: number;
  /** Monto base acordado en el contrato. */
  montoBase: number;
  /** Comision de servicio cobrada al cliente. */
  comisionCliente: number;
  metodoPago: string | null;
  estado: string;
  referenciaPasarela: string | null;
  fechaPago: Date;
  contrato: {
    id: number;
    titulo: string;
    estado: string;
  };
  factura: FacturaCliente | null;
}

export interface PagoFreelancer extends PagoCliente {
  cliente: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
}

/**
 * Estados del dinero en modelo escrow:
 * pendiente -> retenido (la plataforma lo guarda) -> liberado | reembolsado.
 */
export type EstadoPago = 'pendiente' | 'retenido' | 'liberado' | 'reembolsado';

export interface PagoEscrow {
  id: number;
  contratoId: number;
  monto: number;
  estado: EstadoPago;
  metodoPago: string | null;
  referenciaPasarela: string | null;
  preferenciaId: string | null;
  fechaPago: Date;
}
