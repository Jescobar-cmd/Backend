import { PrismaClient } from '@prisma/client';
import { EstadoReporte, NuevaReporte, Reporte, ReporteDetalle } from '../../../domain/entities/Reporte';
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

  async crear(datos: NuevaReporte): Promise<Reporte> {
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

  async contar(filtros: Omit<FiltrosReporte, 'page' | 'limit'>): Promise<number> {
    return this.db.reporte.count({
      where: {
        ...(filtros.estado ? { estado: filtros.estado } : {}),
      },
    });
  }

  async obtenerPorId(id: number): Promise<Reporte | null> {
    const reporte = await this.db.reporte.findUnique({ where: { id } });
    return reporte ? toReporte(reporte) : null;
  }

  async obtenerDetallePorId(id: number): Promise<ReporteDetalle | null> {
    const reporte = await this.db.reporte.findUnique({
      where: { id },
      include: {
        Usuario_Reporte_usuarioReportaIdToUsuario: {
          select: { id: true, nombre: true, fotoPerfil: true },
        },
        Usuario_Reporte_usuarioReportadoIdToUsuario: {
          select: { id: true, nombre: true, fotoPerfil: true },
        },
        Proyecto: { select: { id: true, titulo: true } },
      },
    });
    if (!reporte) return null;

    return {
      ...toReporte(reporte),
      usuarioReporta: reporte.Usuario_Reporte_usuarioReportaIdToUsuario,
      usuarioReportado: reporte.Usuario_Reporte_usuarioReportadoIdToUsuario,
      proyecto: reporte.Proyecto,
    };
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
