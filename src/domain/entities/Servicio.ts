// Servicio publicado por un freelancer (estilo Fiverr).
// El cliente lo explora desde el feed y desde /api/servicios.

export type EstadoServicio = 'activo' | 'pausado' | 'eliminado';

export interface ServicioFreelancer {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  tituloProfesional: string | null;
  calificacionPromedio: number;
}

export interface Servicio {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagenUrl: string | null;
  estado: string;
  fechaCreacion: Date;
  categoria: { id: number; nombre: string } | null;
  freelancer: ServicioFreelancer;
}

/** Datos para crear un servicio. */
export interface NuevoServicio {
  titulo: string;
  descripcion: string;
  precio: number;
  categoriaId?: number | null;
  imagenUrl?: string | null;
}

/** Campos editables. `undefined` = no tocar; `null` = borrar. */
export interface DatosServicio {
  titulo?: string;
  descripcion?: string;
  precio?: number;
  categoriaId?: number | null;
  imagenUrl?: string | null;
}

export interface FiltrosServicio {
  page: number;
  limit: number;
  categoriaId?: number;
  texto?: string;
  estado?: string;
}

export interface ServicioPaginado {
  page: number;
  limit: number;
  total: number;
  items: Servicio[];
}
