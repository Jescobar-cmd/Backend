import { FiltrosServicio, ServicioPaginado } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';

/** Caso de uso: listar el catálogo de servicios activos. */
export class ListarServiciosUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async execute(filtros: FiltrosServicio): Promise<ServicioPaginado> {
    return this.servicioRepository.listar(filtros);
  }
}
