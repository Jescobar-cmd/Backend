import {
  FiltrosPublicacion,
  NuevaPublicacion,
  Publicacion,
  PublicacionPaginada,
} from '../../entities/Publicacion';

/**
 * Puerto del repositorio del blog.
 * `usuarioId` es quien consulta: sirve para calcular `likes.meGusta`.
 */
export interface PublicacionRepository {
  crear(autorId: number, datos: NuevaPublicacion): Promise<Publicacion>;

  listar(filtros: FiltrosPublicacion, usuarioId: number): Promise<PublicacionPaginada>;

  /** Publicación publicada (null si no existe o fue eliminada). */
  obtenerPorId(publicacionId: number, usuarioId: number): Promise<Publicacion | null>;

  /** Borrado lógico: estado = 'eliminado'. */
  eliminar(publicacionId: number): Promise<void>;

  /** Alterna el like. Devuelve null si la publicación no existe. */
  alternarMeGusta(
    publicacionId: number,
    usuarioId: number
  ): Promise<{ meGusta: boolean; totalLikes: number } | null>;
}
