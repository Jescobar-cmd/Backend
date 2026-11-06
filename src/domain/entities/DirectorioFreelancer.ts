import { HabilidadAsignada } from './Habilidad';

/** Tarjeta pública de un freelancer dentro del directorio. */
export interface FreelancerDirectorioItem {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  tituloProfesional: string | null;
  biografia: string | null;
  calificacionPromedio: number;
  habilidades: HabilidadAsignada[];
}

export interface FiltrosDirectorioFreelancer {
  page: number;
  limit: number;
  texto?: string;
  habilidadId?: number;
  categoriaId?: number;
}

export interface DirectorioFreelancerPaginado {
  page: number;
  limit: number;
  total: number;
  items: FreelancerDirectorioItem[];
}
