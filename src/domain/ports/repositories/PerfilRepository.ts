import { DatosPerfilCliente, PerfilCliente, PerfilPublico } from '../../entities/Perfil';

/**
 * Puerto (interfaz) del repositorio de perfiles.
 * El dominio define QUÉ se necesita; la infraestructura decide CÓMO (Prisma).
 * Principio de Segregación de Interfaces: puerto pequeño y específico,
 * sin engordar el UserRepository.
 */
export interface PerfilRepository {
  /** Perfil propio del cliente (datos privados incluidos). */
  obtenerPerfilCliente(usuarioId: number): Promise<PerfilCliente | null>;

  /** Aplica cambios y devuelve el perfil actualizado. */
  actualizarPerfilCliente(usuarioId: number, datos: DatosPerfilCliente): Promise<PerfilCliente | null>;

  /** Perfil público (sin email ni teléfono). */
  obtenerPerfilPublico(usuarioId: number): Promise<PerfilPublico | null>;
}
