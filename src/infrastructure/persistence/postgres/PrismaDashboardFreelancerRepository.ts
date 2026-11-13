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
      entregasPendientes,
      pagosPendientes,
      disputasAbiertas,
      notificacionesSinLeer,
      freelancer,
      estadisticas,
      liquidaciones,
    ] = await Promise.all([
      this.db.contrato.count({ where: { freelancerId, estado: 'activo' } }),
      this.db.contrato.count({ where: { freelancerId, estado: 'completado' } }),
      this.db.propuesta.count({ where: { freelancerId, estado: 'pendiente' } }),
      this.db.servicio.count({ where: { freelancerId, estado: 'activo' } }),
      this.db.entregaContrato.count({
        where: { estado: 'enviada', Contrato: { freelancerId } },
      }),
      this.db.pago.count({
        where: { estado: 'pendiente', Contrato: { freelancerId } },
      }),
      this.db.disputa.count({
        where: {
          estado: { in: ['abierta', 'en_revision'] },
          Contrato: { freelancerId },
        },
      }),
      this.db.notificacion.count({
        where: { usuarioId: freelancerId, leida: false },
      }),
      this.db.freelancer.findUnique({
        where: { id: freelancerId },
        select: { calificacionPromedio: true },
      }),
      this.db.estadisticaFreelancer.aggregate({
        where: { freelancerId },
        _sum: { visitasPerfil: true, visualizacionesPropuesta: true },
      }),
      this.db.liquidacion.aggregate({
        where: { freelancerId, estado: 'pendiente' },
        _sum: { montoNeto: true },
      }),
    ]);

    return {
      contratosActivos,
      contratosCompletados,
      propuestasPendientes,
      serviciosActivos,
      entregasPendientes,
      pagosPendientes,
      disputasAbiertas,
      notificacionesSinLeer,
      calificacionPromedio: freelancer ? Number(freelancer.calificacionPromedio) : 0,
      visitasPerfil: estadisticas._sum.visitasPerfil ?? 0,
      visualizacionesPropuesta: estadisticas._sum.visualizacionesPropuesta ?? 0,
      saldoDisponible: Number(liquidaciones._sum.montoNeto ?? 0),
    };
  }
}
