import { PerfilPublico } from '../../domain/entities/Perfil';
import { EstadisticaFreelancerRepository } from '../../domain/ports/repositories/EstadisticaFreelancerRepository';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver el perfil público de cualquier usuario (sin email ni teléfono). */
export class ObtenerPerfilPublicoUseCase {
  constructor(
    private perfilRepository: PerfilRepository,
    private estadisticaRepository?: EstadisticaFreelancerRepository
  ) {}

  async ejecutar(usuarioId: number, visitanteId?: number): Promise<PerfilPublico> {
    const perfil = await this.perfilRepository.obtenerPerfilPublico(usuarioId);
    if (!perfil) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    // Métrica de negocio: registrar visita al perfil de freelancer si el visitante no es el propio dueño
    if (perfil.freelancer && visitanteId !== usuarioId && this.estadisticaRepository) {
      void this.estadisticaRepository.registrarVisitaPerfil(usuarioId).catch((error) => {
        console.warn(`[Metrica] Error registrando visita al perfil ${usuarioId}:`, error);
      });
    }

    return perfil;
  }
}
