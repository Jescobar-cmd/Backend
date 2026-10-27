import { PerfilPublico } from '../../domain/entities/Perfil';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver el perfil público de cualquier usuario (sin email ni teléfono). */
export class ObtenerPerfilPublicoUseCase {
  constructor(private perfilRepository: PerfilRepository) {}

  async ejecutar(usuarioId: number): Promise<PerfilPublico> {
    const perfil = await this.perfilRepository.obtenerPerfilPublico(usuarioId);
    if (!perfil) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }
    return perfil;
  }
}
