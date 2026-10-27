import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';
import { ROLES } from '../../shared/constants/roles';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: borrar (lógicamente) una publicación. Solo el autor o un admin. */
export class EliminarPublicacionUseCase {
  constructor(private publicacionRepository: PublicacionRepository) {}

  async execute(publicacionId: number, usuarioId: number, rol: number): Promise<void> {
    const publicacion = await this.publicacionRepository.obtenerPorId(publicacionId, usuarioId);
    if (!publicacion) {
      throw new NotFoundError('Publicación no encontrada');
    }
    if (publicacion.autor.id !== usuarioId && rol !== ROLES.ADMIN) {
      throw new ForbiddenError('Solo el autor puede eliminar esta publicación');
    }
    await this.publicacionRepository.eliminar(publicacionId);
  }
}
