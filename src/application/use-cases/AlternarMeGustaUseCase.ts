import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: dar o quitar "me gusta" a una publicación (toggle). */
export class AlternarMeGustaUseCase {
  constructor(private publicacionRepository: PublicacionRepository) {}

  async execute(
    publicacionId: number,
    usuarioId: number
  ): Promise<{ meGusta: boolean; totalLikes: number }> {
    const resultado = await this.publicacionRepository.alternarMeGusta(publicacionId, usuarioId);
    if (!resultado) {
      throw new NotFoundError('Publicación no encontrada');
    }
    return resultado;
  }
}
