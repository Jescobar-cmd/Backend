import { PrismaClient } from '@prisma/client';
import { EstadoReporte, Reporte } from '../../../domain/entities/Reporte';
import { FiltrosReporte, ReporteRepository } from '../../../domain/ports/repositories/ReporteRepository';

function toReporte(
  reporte: {
    id: number;
    usuarioReportaId: number;
    usuarioReportadoId: number | null;
    proyectoId: number | null;
    adminId: number | null;
    motivo: string;
    descripcion: string | null;
    estado: string;
    resolucion: string | null;
    fechaResolucion: Date | null;
    fecha: Date;
  }
): Reporte {
  return {
    id: reporte.id,
    usuarioReportaId: reporte.usuarioReportaId,
    usuarioReportadoId: reporte.usuarioReportadoId,
    proyectoId: reporte.proyectoId,
    adminId: reporte.adminId,
    motivo: reporte.motivo,
    descripcion: reporte.descripcion,
    estado: reporte.estado as EstadoReporte,
    resolucion: reporte.resolucion,
    fechaResolucion: reporte.fechaResolucion,
    fecha: reporte.fecha,
  };
}

/** Adaptador Prisma del puerto ReporteRepository. */
export class PrismaReporteRepository implements ReporteRepository {
  constructor(private db: PrismaClient) {}

  async crear(
    datos: Omit<Reporte, 'id' | 'fecha' | 'fechaResolucion'>
  ): Promise<Reporte> {
    const creada = await this.db.reporte.create({
      data: {
        usuarioReportaId: datos.usuarioReportaId,
        usuarioReportadoId: datos.usuarioReportadoId,
        proyectoId: datos.proyectoId,
        adminId: datos.adminId,
        motivo: datos.motivo,
        descripcion: datos.descripcion,
        estado: datos.estado,
      },
    });
    return toReporte(creada);
  }

  async listar(filtros: FiltrosReporte): Promise<Reporte[]> {
    const items = await this.db.reporte.findMany({
      where: {
        ...(filtros.estado ? { estado: filtros.estado } : {}),
      },
      orderBy: { fecha: 'desc' },
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    });
    return items.map(toReporte);
  }

  async obtenerPorId(id: number): Promise<Reporte | null> {
    const reporte = await this.db.reporte.findUnique({ where: { id } });
    return reporte ? toReporte(reporte) : null;
  }

  async resolver(
    id: number,
    adminId: number,
    resolucion: string,
    estado: EstadoReporte
  ): Promise<Reporte> {
    const actualizada = await this.db.reporte.update({
      where: { id },
      data: {
        estado,
        resolucion,
        fechaResolucion: new Date(),
        adminId,
      },
    });
    return toReporte(actualizada);
  }
}
