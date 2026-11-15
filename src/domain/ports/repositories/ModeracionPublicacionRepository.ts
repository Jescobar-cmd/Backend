import {
  DatosModeracionPublicacion,
  ModeracionPublicacion,
  TipoPublicacion,
} from '../../entities/ModeracionPublicacion';

/** Puerto del historial de moderación de publicaciones (servicios y proyectos). */
export interface ModeracionPublicacionRepository {
  listarPorPublicacion(
    tipo: TipoPublicacion,
    publicacionId: number
  ): Promise<ModeracionPublicacion[]>;

  /** Último registro primero; usado para el estado "retirada" de la vista. */
  listarUltimas(
    tipo: TipoPublicacion,
    publicacionId: number,
    limit: number
  ): Promise<ModeracionPublicacion[]>;

  crear(datos: DatosModeracionPublicacion): Promise<ModeracionPublicacion>;
}
