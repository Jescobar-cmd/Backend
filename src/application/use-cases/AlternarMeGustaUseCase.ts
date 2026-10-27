import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: dar o quitar "me gusta" a una publicación (toggle). */
export class AlternarMeGustaUseCase {
  constructor(private publicacionRepository: PublicacionRepository) {}

  async ejecutar(
    publicacionId: number,
    usuarioId: number
  ): Promise<{ meGusta: boolean; totalLikes: number }> {
    const resultado = await this.publicacionRepository.alternarMeGusta(publicacionId, usuarioId);
    if (!resultado) {
      throw new ErrorNoEncontrado('Publicación no encontrada');
    }
    return resultado;
  }
}
