import {
  FiltrosPublicacion,
  PublicacionPaginada,
} from '../../domain/entities/Publicacion';
import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';

/** Caso de uso: listar el blog (paginado, solo publicaciones publicadas). */
export class ListarPublicacionesUseCase {
  constructor(private publicacionRepository: PublicacionRepository) {}

  async execute(usuarioId: number, filtros: FiltrosPublicacion): Promise<PublicacionPaginada> {
    return this.publicacionRepository.listar(filtros, usuarioId);
  }
}
