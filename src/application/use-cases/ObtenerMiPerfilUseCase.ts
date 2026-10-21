import { PerfilCliente } from '../../domain/entities/Perfil';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: ver el perfil propio del cliente autenticado. */
export class ObtenerMiPerfilUseCase {
  constructor(private perfilRepository: PerfilRepository) {}

  async execute(usuarioId: number): Promise<PerfilCliente> {
    const perfil = await this.perfilRepository.obtenerPerfilCliente(usuarioId);
    if (!perfil) {
      throw new NotFoundError('Perfil no encontrado');
    }
    return perfil;
  }
}
