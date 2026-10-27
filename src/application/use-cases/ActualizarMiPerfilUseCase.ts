import { DatosPerfilCliente, PerfilCliente } from '../../domain/entities/Perfil';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: actualizar el perfil propio del cliente autenticado. */
export class ActualizarMiPerfilUseCase {
  constructor(private perfilRepository: PerfilRepository) {}

  async ejecutar(usuarioId: number, datos: DatosPerfilCliente): Promise<PerfilCliente> {
    const perfil = await this.perfilRepository.actualizarPerfilCliente(usuarioId, datos);
    if (!perfil) {
      throw new ErrorNoEncontrado('Perfil no encontrado');
    }
    return perfil;
  }
}
