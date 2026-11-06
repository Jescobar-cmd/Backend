import { EstadisticaFreelancer } from '../../entities/EstadisticaFreelancer';

/** Puerto de las métricas diarias del freelancer. */
export interface EstadisticaFreelancerRepository {
  registrarVisitaPerfil(freelancerId: number, fecha?: Date): Promise<void>;

  registrarVisualizacionPropuesta(freelancerId: number, fecha?: Date): Promise<void>;

  listarPorFreelancer(
    freelancerId: number,
    desde?: Date,
    hasta?: Date
  ): Promise<EstadisticaFreelancer[]>;
}
