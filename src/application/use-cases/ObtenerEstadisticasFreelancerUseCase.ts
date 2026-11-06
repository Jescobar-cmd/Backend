import { ResumenEstadisticasFreelancer } from '../../domain/entities/EstadisticaFreelancer';
import { EstadisticaFreelancerRepository } from '../../domain/ports/repositories/EstadisticaFreelancerRepository';

/** Caso de uso: obtener el resumen de métricas del freelancer autenticado. */
export class ObtenerEstadisticasFreelancerUseCase {
  constructor(private estadisticaRepository: EstadisticaFreelancerRepository) {}

  async ejecutar(
    freelancerId: number,
    desde?: Date,
    hasta?: Date
  ): Promise<ResumenEstadisticasFreelancer> {
    const dias = await this.estadisticaRepository.listarPorFreelancer(
      freelancerId,
      desde,
      hasta
    );

    return {
      totalVisitasPerfil: dias.reduce((total, dia) => total + dia.visitasPerfil, 0),
      totalVisualizacionesPropuesta: dias.reduce(
        (total, dia) => total + dia.visualizacionesPropuesta,
        0
      ),
      dias,
    };
  }
}
