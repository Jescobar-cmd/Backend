export type EstadoEntrega = 'enviada' | 'aprobada' | 'rechazada';

export interface EntregaContrato {
  id: number;
  contratoId: number;
  autorId: number;
  mensaje: string | null;
  archivoUrl: string | null;
  enlaceUrl: string | null;
  estado: EstadoEntrega;
  fechaEntrega: Date;
  fechaRevision: Date | null;
  revisadoPorId: number | null;
}

export interface NuevaEntregaContrato {
  contratoId: number;
  autorId: number;
  mensaje?: string | null;
  archivoUrl?: string | null;
  enlaceUrl?: string | null;
}
