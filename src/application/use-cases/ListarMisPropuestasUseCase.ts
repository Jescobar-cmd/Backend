import { PropuestaResumen } from '../../domain/entities/Propuesta';
import { PropuestaRepository } from '../../domain/ports/repositories/PropuestaRepository';

/** Caso de uso: el freelancer lista las propuestas que envió. */
export class ListarMisPropuestasUseCase {
  constructor(private propuestaRepository: PropuestaRepository) {}

  async ejecutar(freelancerId: number): Promise<PropuestaResumen[]> {
    return this.propuestaRepository.listarPorFreelancer(freelancerId);
  }
}
