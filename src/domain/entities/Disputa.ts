export type EstadoDisputa = 'abierta' | 'en_revision' | 'resuelta' | 'rechazada';

export interface Disputa {
  id: number;
  contratoId: number;
  abiertaPorId: number;
  motivo: string;
  descripcion: string;
  evidenciaUrl: string | null;
  estado: EstadoDisputa;
  resolucion: string | null;
  resueltaPorId: number | null;
  fechaApertura: Date;
  fechaResolucion: Date | null;
}

export interface NuevaDisputa {
  contratoId: number;
  abiertaPorId: number;
  motivo: string;
  descripcion: string;
  evidenciaUrl?: string | null;
}
