import { Publicacion } from '../../domain/entities/Publicacion';
import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: ver una publicación del blog. */
export class ObtenerPublicacionUseCase {
  constructor(private publicacionRepository: PublicacionRepository) {}

  async execute(publicacionId: number, usuarioId: number): Promise<Publicacion> {
    const publicacion = await this.publicacionRepository.obtenerPorId(publicacionId, usuarioId);
    if (!publicacion) {
      throw new NotFoundError('Publicación no encontrada');
    }
    return publicacion;
  }
}
