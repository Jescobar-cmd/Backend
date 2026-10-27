import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';
import { ROLES } from '../../shared/constants/roles';
import { ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: borrar (lógicamente) una publicación. Solo el autor o un admin. */
export class EliminarPublicacionUseCase {
  constructor(private publicacionRepository: PublicacionRepository) {}

  async ejecutar(publicacionId: number, usuarioId: number, rol: number): Promise<void> {
    const publicacion = await this.publicacionRepository.obtenerPorId(publicacionId, usuarioId);
    if (!publicacion) {
      throw new ErrorNoEncontrado('Publicación no encontrada');
    }
    if (publicacion.autor.id !== usuarioId && rol !== ROLES.ADMIN) {
      throw new ErrorProhibido('Solo el autor puede eliminar esta publicación');
    }
    await this.publicacionRepository.eliminar(publicacionId);
  }
}
