import {
  DirectorioFreelancerPaginado,
  FiltrosDirectorioFreelancer,
} from '../../domain/entities/DirectorioFreelancer';
import { DirectorioFreelancerRepository } from '../../domain/ports/repositories/DirectorioFreelancerRepository';

/** Caso de uso: buscar freelancers en el directorio público. */
export class BuscarFreelancersUseCase {
  constructor(private directorioRepository: DirectorioFreelancerRepository) {}

  async ejecutar(
    filtros: FiltrosDirectorioFreelancer
  ): Promise<DirectorioFreelancerPaginado> {
    return this.directorioRepository.buscar(filtros);
  }
}
