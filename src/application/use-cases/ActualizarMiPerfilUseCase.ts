import { DatosPerfilCliente, PerfilCliente } from '../../domain/entities/Perfil';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: actualizar el perfil propio del cliente autenticado. */
export class ActualizarMiPerfilUseCase {
  constructor(private perfilRepository: PerfilRepository) {}

  async execute(usuarioId: number, datos: DatosPerfilCliente): Promise<PerfilCliente> {
    const perfil = await this.perfilRepository.actualizarPerfilCliente(usuarioId, datos);
    if (!perfil) {
      throw new NotFoundError('Perfil no encontrado');
    }
    return perfil;
  }
}
