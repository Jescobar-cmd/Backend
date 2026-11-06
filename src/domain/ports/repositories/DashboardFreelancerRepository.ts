import { DashboardFreelancer } from '../../entities/DashboardFreelancer';

/** Puerto de lectura para el resumen del panel del freelancer. */
export interface DashboardFreelancerRepository {
  obtener(freelancerId: number): Promise<DashboardFreelancer>;
}
