import { PrismaClient } from '@prisma/client';
import { EstadisticaFreelancer } from '../../../domain/entities/EstadisticaFreelancer';
import { EstadisticaFreelancerRepository } from '../../../domain/ports/repositories/EstadisticaFreelancerRepository';
import { ROLES } from '../../../shared/constants/roles';

/** Normaliza a fecha UTC para que la columna DATE no dependa del huso horario. */
function fechaUtc(fecha: Date = new Date()): Date {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
}

/** Adaptador Prisma de las métricas diarias del freelancer. */
export class PrismaEstadisticaFreelancerRepository implements EstadisticaFreelancerRepository {
  constructor(private db: PrismaClient) {}

  /**
   * Garantiza la existencia de la fila en `Freelancer` (relación foránea obligatoria)
   * para cualquier usuario registrado con rol de freelancer, evitando fallos o pérdidas de métricas.
   */
  private async asegurarFreelancer(freelancerId: number): Promise<boolean> {
    const usuario = await this.db.usuario.findUnique({
      where: { id: freelancerId },
      select: { id: true, rolId: true },
    });
    if (!usuario || usuario.rolId !== ROLES.FREELANCER) {
      return false;
    }

    await this.db.freelancer.upsert({
      where: { id: freelancerId },
      create: { id: freelancerId },
      update: {},
    });
    return true;
  }

  async registrarVisitaPerfil(freelancerId: number, fecha: Date = new Date()): Promise<void> {
    if (!(await this.asegurarFreelancer(freelancerId))) return;

    const dia = fechaUtc(fecha);
    await this.db.estadisticaFreelancer.upsert({
      where: { freelancerId_fecha: { freelancerId, fecha: dia } },
      create: { freelancerId, fecha: dia, visitasPerfil: 1 },
      update: { visitasPerfil: { increment: 1 } },
    });
  }

  async registrarVisualizacionPropuesta(
    freelancerId: number,
    fecha: Date = new Date()
  ): Promise<void> {
    if (!(await this.asegurarFreelancer(freelancerId))) return;

    const dia = fechaUtc(fecha);
    await this.db.estadisticaFreelancer.upsert({
      where: { freelancerId_fecha: { freelancerId, fecha: dia } },
      create: { freelancerId, fecha: dia, visualizacionesPropuesta: 1 },
      update: { visualizacionesPropuesta: { increment: 1 } },
    });
  }

  async listarPorFreelancer(
    freelancerId: number,
    desde?: Date,
    hasta?: Date
  ): Promise<EstadisticaFreelancer[]> {
    const filas = await this.db.estadisticaFreelancer.findMany({
      where: {
        freelancerId,
        ...(desde || hasta
          ? {
              fecha: {
                ...(desde ? { gte: fechaUtc(desde) } : {}),
                ...(hasta ? { lte: fechaUtc(hasta) } : {}),
              },
            }
          : {}),
      },
      orderBy: { fecha: 'asc' },
    });

    return filas.map((fila) => ({
      id: fila.id,
      freelancerId: fila.freelancerId,
      fecha: fila.fecha,
      visitasPerfil: fila.visitasPerfil,
      visualizacionesPropuesta: fila.visualizacionesPropuesta,
    }));
  }
}
