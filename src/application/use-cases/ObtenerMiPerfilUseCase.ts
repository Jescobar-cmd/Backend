import { PerfilCliente } from '../../domain/entities/Perfil';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver el perfil propio del cliente autenticado. */
export class ObtenerMiPerfilUseCase {
  constructor(private perfilRepository: PerfilRepository) {}

  async ejecutar(usuarioId: number): Promise<PerfilCliente> {
    const perfil = await this.perfilRepository.obtenerPerfilCliente(usuarioId);
    if (!perfil) {
      throw new ErrorNoEncontrado('Perfil no encontrado');
    }
    return perfil;
  }
}
