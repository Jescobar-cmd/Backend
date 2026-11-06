/** Ítem del portafolio de un freelancer. */
export interface PortafolioItem {
  id: number;
  freelancerId: number;
  titulo: string;
  descripcion: string | null;
  imagenUrl: string | null;
  enlaceUrl: string | null;
  fechaCreacion: Date;
}

/** Datos para crear un ítem del portafolio. */
export interface NuevoPortafolioItem {
  titulo: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  enlaceUrl?: string | null;
}

/** Campos editables. `undefined` = no tocar; `null` = borrar. */
export interface DatosPortafolioItem {
  titulo?: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  enlaceUrl?: string | null;
}
