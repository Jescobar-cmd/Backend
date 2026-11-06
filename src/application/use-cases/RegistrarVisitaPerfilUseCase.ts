import { EstadisticaFreelancerRepository } from '../../domain/ports/repositories/EstadisticaFreelancerRepository';

/** Caso de uso: registrar una visita al perfil público de un freelancer. */
export class RegistrarVisitaPerfilUseCase {
  constructor(private estadisticaRepository: EstadisticaFreelancerRepository) {}

  async ejecutar(freelancerId: number): Promise<void> {
    await this.estadisticaRepository.registrarVisitaPerfil(freelancerId);
  }
}
