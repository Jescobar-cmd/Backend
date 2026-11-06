import { DashboardFreelancer } from '../../domain/entities/DashboardFreelancer';
import { DashboardFreelancerRepository } from '../../domain/ports/repositories/DashboardFreelancerRepository';

/** Caso de uso: obtener el resumen del panel del freelancer. */
export class ObtenerDashboardFreelancerUseCase {
  constructor(private dashboardRepository: DashboardFreelancerRepository) {}

  async ejecutar(freelancerId: number): Promise<DashboardFreelancer> {
    return this.dashboardRepository.obtener(freelancerId);
  }
}
