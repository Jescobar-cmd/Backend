/** Habilidad del catálogo (React, Figma, SQL, etc.). */
export interface Habilidad {
  id: number;
  nombre: string;
  categoriaId: number | null;
  categoria: { id: number; nombre: string } | null;
}

/** Habilidad asignada a un freelancer. */
export interface HabilidadAsignada {
  id: number;
  nombre: string;
  nivel: string | null;
}
