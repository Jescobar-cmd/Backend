import { PrismaClient } from '@prisma/client';
import { DashboardFreelancer } from '../../../domain/entities/DashboardFreelancer';
import { DashboardFreelancerRepository } from '../../../domain/ports/repositories/DashboardFreelancerRepository';

/** Adaptador de lectura para el resumen del panel del freelancer. */
export class PrismaDashboardFreelancerRepository implements DashboardFreelancerRepository {
  constructor(private db: PrismaClient) {}

  async obtener(freelancerId: number): Promise<DashboardFreelancer> {
    const [
      contratosActivos,
      contratosCompletados,
      propuestasPendientes,
      serviciosActivos,
      freelancer,
      estadisticas,
    ] = await Promise.all([
      this.db.contrato.count({ where: { freelancerId, estado: 'activo' } }),
      this.db.contrato.count({ where: { freelancerId, estado: 'completado' } }),
      this.db.propuesta.count({ where: { freelancerId, estado: 'pendiente' } }),
      this.db.servicio.count({ where: { freelancerId, estado: 'activo' } }),
      this.db.freelancer.findUnique({
        where: { id: freelancerId },
        select: { calificacionPromedio: true },
      }),
      this.db.estadisticaFreelancer.aggregate({
        where: { freelancerId },
        _sum: { visitasPerfil: true, visualizacionesPropuesta: true },
      }),
    ]);

    return {
      contratosActivos,
      contratosCompletados,
      propuestasPendientes,
      serviciosActivos,
      calificacionPromedio: freelancer ? Number(freelancer.calificacionPromedio) : 0,
      visitasPerfil: estadisticas._sum.visitasPerfil ?? 0,
      visualizacionesPropuesta: estadisticas._sum.visualizacionesPropuesta ?? 0,
    };
  }
}
