import { PerfilFreelancer } from '../../domain/entities/Perfil';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: obtener el perfil propio del freelancer autenticado. */
export class ObtenerMiPerfilFreelancerUseCase {
  constructor(private perfilRepository: PerfilRepository) {}

  async ejecutar(usuarioId: number): Promise<PerfilFreelancer> {
    const perfil = await this.perfilRepository.obtenerPerfilFreelancer(usuarioId);
    if (!perfil) {
      throw new ErrorNoEncontrado('Perfil de freelancer no encontrado');
    }
    return perfil;
  }
}
