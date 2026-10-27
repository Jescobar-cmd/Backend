import {
  DatosPerfilCliente,
  DatosPerfilFreelancer,
  PerfilCliente,
  PerfilFreelancer,
  PerfilPublico,
} from '../../entities/Perfil';

/**
 * Puerto (interfaz) del repositorio de perfiles.
 * El dominio define QUÉ se necesita; la infraestructura decide CÓMO (Prisma).
 * Principio de Segregación de Interfaces: puerto pequeño y específico,
 * sin engordar el RepositorioUsuario.
 */
export interface PerfilRepository {
  /** Perfil propio del cliente (datos privados incluidos). */
  obtenerPerfilCliente(usuarioId: number): Promise<PerfilCliente | null>;

  /** Aplica cambios y devuelve el perfil actualizado. */
  actualizarPerfilCliente(usuarioId: number, datos: DatosPerfilCliente): Promise<PerfilCliente | null>;

  /** Perfil propio del freelancer (datos privados incluidos). */
  obtenerPerfilFreelancer(usuarioId: number): Promise<PerfilFreelancer | null>;

  /** Actualiza el perfil del freelancer y sus habilidades. */
  actualizarPerfilFreelancer(
    usuarioId: number,
    datos: DatosPerfilFreelancer
  ): Promise<PerfilFreelancer | null>;

  /** Perfil público (sin email ni teléfono). */
  obtenerPerfilPublico(usuarioId: number): Promise<PerfilPublico | null>;
}
