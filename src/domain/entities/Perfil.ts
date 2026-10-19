// Tipos de perfil del usuario (Fase 1 - Cliente).
// Dominio puro: no conoce Prisma, Express ni ninguna librería externa.

export type PerfilTipoCliente = 'natural' | 'empresa';

/** Datos de empresa del cliente. */
export interface ClientePerfil {
  nombreEmpresa: string | null;
  tipoCliente: string;
  descripcion: string | null;
}

/** Datos públicos del freelancer (lo que se muestra al ver su perfil). */
export interface FreelancerPerfil {
  tituloProfesional: string | null;
  biografia: string | null;
  calificacionPromedio: number;
}

/** Perfil propio del cliente: incluye datos privados (email, teléfono). */
export interface PerfilCliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  fotoPerfil: string | null;
  rolId: number;
  rolNombre: string;
  estado: string;
  fechaRegistro: Date;
  cliente: ClientePerfil;
}

/** Perfil público de cualquier usuario: SIN email ni teléfono. */
export interface PerfilPublico {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  rolId: number;
  rolNombre: string;
  fechaRegistro: Date;
  cliente: ClientePerfil | null;
  freelancer: FreelancerPerfil | null;
}

/**
 * Campos editables del perfil del cliente.
 * `undefined` = no tocar ese campo. `null` = borrar el valor (aplica a los opcionales).
 */
export interface DatosPerfilCliente {
  nombre?: string;
  telefono?: string | null;
  fotoPerfil?: string | null;
  descripcion?: string | null;
  nombreEmpresa?: string | null;
  tipoCliente?: PerfilTipoCliente;
}
