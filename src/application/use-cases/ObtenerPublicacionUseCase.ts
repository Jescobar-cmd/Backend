import { Publicacion } from '../../domain/entities/Publicacion';
import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver una publicación del blog. */
export class ObtenerPublicacionUseCase {
  constructor(private publicacionRepository: PublicacionRepository) {}

  async ejecutar(publicacionId: number, usuarioId: number): Promise<Publicacion> {
    const publicacion = await this.publicacionRepository.obtenerPorId(publicacionId, usuarioId);
    if (!publicacion) {
      throw new ErrorNoEncontrado('Publicación no encontrada');
    }
    return publicacion;
  }
}
