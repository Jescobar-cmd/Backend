// Oferta = el trabajo que publica el CLIENTE (modelo `Proyecto` en la base de datos).
// No confundir con OfertaChat (contraofertas del chat, Fase 4).

export type EstadoOferta = 'abierto' | 'en_progreso' | 'completado' | 'cancelado';

export interface Oferta {
  id: number;
  titulo: string;
  descripcion: string;
  presupuesto: number | null;
  plazoDias: number | null;
  estado: string;
  imagenUrl: string | null;
  fechaPublicacion: Date;
  categoria: { id: number; nombre: string } | null;
  habilidades: { id: number; nombre: string }[];
  totalPropuestas: number;
}

/** Datos para crear una oferta (título y descripción obligatorios). */
export interface NuevaOferta {
  titulo: string;
  descripcion: string;
  presupuesto?: number | null;
  plazoDias?: number | null;
  categoriaId?: number | null;
  imagenUrl?: string | null;
  habilidadIds?: number[];
}

/** Campos editables. `undefined` = no tocar; `null` = borrar. */
export interface DatosOferta {
  titulo?: string;
  descripcion?: string;
  presupuesto?: number | null;
  plazoDias?: number | null;
  categoriaId?: number | null;
  imagenUrl?: string | null;
  habilidadIds?: number[];
}

export interface FiltrosOferta {
  estado?: string;
  texto?: string;
  page: number;
  limit: number;
}

export interface OfertaPaginada {
  page: number;
  limit: number;
  total: number;
  items: Oferta[];
}
