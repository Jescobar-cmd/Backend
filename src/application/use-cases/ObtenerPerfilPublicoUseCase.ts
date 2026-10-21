import { PerfilPublico } from '../../domain/entities/Perfil';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: ver el perfil público de cualquier usuario (sin email ni teléfono). */
export class ObtenerPerfilPublicoUseCase {
  constructor(private perfilRepository: PerfilRepository) {}

  async execute(usuarioId: number): Promise<PerfilPublico> {
    const perfil = await this.perfilRepository.obtenerPerfilPublico(usuarioId);
    if (!perfil) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return perfil;
  }
}
