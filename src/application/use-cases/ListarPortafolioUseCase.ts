import { PortafolioItem } from '../../domain/entities/PortafolioItem';
import { PortafolioRepository } from '../../domain/ports/repositories/PortafolioRepository';

/** Caso de uso: listar el portafolio de un freelancer. */
export class ListarPortafolioUseCase {
  constructor(private portafolioRepository: PortafolioRepository) {}

  async ejecutar(freelancerId: number): Promise<PortafolioItem[]> {
    return this.portafolioRepository.listarPorFreelancer(freelancerId);
  }
}
