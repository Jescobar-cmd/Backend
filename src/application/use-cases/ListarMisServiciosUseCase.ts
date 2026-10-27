import { FiltrosServicio, ServicioPaginado } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';

/** Caso de uso: el freelancer lista sus propios servicios. */
export class ListarMisServiciosUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async execute(freelancerId: number, filtros: FiltrosServicio): Promise<ServicioPaginado> {
    return this.servicioRepository.listarPorFreelancer(freelancerId, filtros);
  }
}
