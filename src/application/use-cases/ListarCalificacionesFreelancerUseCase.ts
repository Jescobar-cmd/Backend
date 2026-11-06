import { Calificacion } from '../../domain/entities/Calificacion';
import { CalificacionRepository } from '../../domain/ports/repositories/CalificacionRepository';

/** Caso de uso: ver las calificaciones públicas recibidas por un freelancer. */
export class ListarCalificacionesFreelancerUseCase {
  constructor(private calificacionRepository: CalificacionRepository) {}

  async ejecutar(freelancerId: number, limite = 20): Promise<Calificacion[]> {
    return this.calificacionRepository.listarPorCalificado(freelancerId, limite);
  }
}
