import { PropuestaResumen } from '../../domain/entities/Propuesta';
import { EstadisticaFreelancerRepository } from '../../domain/ports/repositories/EstadisticaFreelancerRepository';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver las propuestas recibidas en una oferta propia. */
export class ListarPropuestasDeOfertaUseCase {
  constructor(
    private ofertaRepository: OfertaRepository,
    private estadisticaRepository: EstadisticaFreelancerRepository
  ) {}

  async ejecutar(clienteId: number, ofertaId: number): Promise<PropuestaResumen[]> {
    const propuestas = await this.ofertaRepository.listarPropuestas(clienteId, ofertaId);
    if (propuestas === null) {
      throw new ErrorNoEncontrado('Oferta no encontrada');
    }

    // Métrica de negocio: el cliente vio las propuestas de estos freelancers.
    // Un fallo de métricas nunca debe romper la consulta principal.
    await Promise.allSettled(
      propuestas.map((propuesta) =>
        this.estadisticaRepository.registrarVisualizacionPropuesta(
          propuesta.freelancer.id
        )
      )
    );

    return propuestas;
  }
}
