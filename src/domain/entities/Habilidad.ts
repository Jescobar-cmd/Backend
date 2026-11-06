/** Habilidad del catálogo (React, Figma, SQL, etc.). */
export interface Habilidad {
  id: number;
  nombre: string;
  categoriaId: number | null;
  categoria: { id: number; nombre: string } | null;
}

/** Niveles admitidos por la aplicación para una habilidad asignada. */
export type NivelHabilidad = 'basico' | 'intermedio' | 'avanzado' | 'experto';

/** Habilidad asignada a un freelancer. */
export interface HabilidadAsignada {
  id: number;
  nombre: string;
  nivel: string | null;
}

/** Habilidad con el nivel que el freelancer quiere declarar. */
export interface HabilidadConNivel {
  id: number;
  nivel: NivelHabilidad | null;
}
