import { PrismaClient } from '@prisma/client';
import {
  EstadoLiquidacion,
  Liquidacion,
  NuevaLiquidacion,
  ResumenLiquidaciones,
  ResultadoSolicitudRetiro,
} from '../../../domain/entities/Liquidacion';
import { LiquidacionRepository } from '../../../domain/ports/repositories/LiquidacionRepository';

function redondearDos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function toLiquidacion(liquidacion: {
  id: number;
  freelancerId: number;
  contratoId: number | null;
  montoBruto: { toString(): string } | number;
  comision: { toString(): string } | number;
  montoNeto: { toString(): string } | number;
  estado: string;
  referencia: string | null;
  motivoRechazo: string | null;
  fechaCreacion: Date;
  fechaSolicitud: Date | null;
  fechaPago: Date | null;
}): Liquidacion {
  return {
    id: liquidacion.id,
    freelancerId: liquidacion.freelancerId,
    contratoId: liquidacion.contratoId,
    montoBruto: Number(liquidacion.montoBruto),
    comision: Number(liquidacion.comision),
    montoNeto: Number(liquidacion.montoNeto),
    estado: liquidacion.estado as EstadoLiquidacion,
    referencia: liquidacion.referencia,
    motivoRechazo: liquidacion.motivoRechazo,
    fechaCreacion: liquidacion.fechaCreacion,
    fechaSolicitud: liquidacion.fechaSolicitud,
    fechaPago: liquidacion.fechaPago,
  };
}

/** Adaptador Prisma del puerto LiquidacionRepository. */
export class PrismaLiquidacionRepository implements LiquidacionRepository {
  constructor(private db: PrismaClient) {}

  async crearParaContrato(datos: NuevaLiquidacion): Promise<Liquidacion> {
    const liquidacion = await this.db.liquidacion.upsert({
      where: { contratoId: datos.contratoId },
      create: {
        freelancerId: datos.freelancerId,
        contratoId: datos.contratoId,
        montoBruto: datos.montoBruto,
        comision: datos.comision,
        montoNeto: datos.montoNeto,
      },
      update: {},
    });
    return toLiquidacion(liquidacion);
  }

  async listarPorFreelancer(freelancerId: number): Promise<Liquidacion[]> {
    const liquidaciones = await this.db.liquidacion.findMany({
      where: { freelancerId },
      orderBy: { fechaCreacion: 'desc' },
    });
    return liquidaciones.map(toLiquidacion);
  }

  async resumen(freelancerId: number): Promise<ResumenLiquidaciones> {
    const [pendiente, solicitada, pagada, total] = await Promise.all([
      this.db.liquidacion.aggregate({
        where: { freelancerId, estado: 'pendiente' },
        _sum: { montoNeto: true },
      }),
      this.db.liquidacion.aggregate({
        where: { freelancerId, estado: 'solicitada' },
        _sum: { montoNeto: true },
      }),
      this.db.liquidacion.aggregate({
        where: { freelancerId, estado: 'pagada' },
        _sum: { montoNeto: true },
      }),
      this.db.liquidacion.aggregate({
        where: { freelancerId },
        _sum: { comision: true },
        _count: { _all: true },
      }),
    ]);

    return {
      saldoDisponible: redondearDos(Number(pendiente._sum.montoNeto ?? 0)),
      saldoEnProceso: redondearDos(Number(solicitada._sum.montoNeto ?? 0)),
      totalPagado: redondearDos(Number(pagada._sum.montoNeto ?? 0)),
      comisionTotal: redondearDos(Number(total._sum.comision ?? 0)),
      totalLiquidaciones: total._count._all,
    };
  }

  async solicitarRetiro(freelancerId: number): Promise<ResultadoSolicitudRetiro> {
    return this.db.$transaction(async (tx) => {
      const pendientes = await tx.liquidacion.findMany({
        where: { freelancerId, estado: 'pendiente' },
        select: { id: true, montoNeto: true },
      });
      if (pendientes.length === 0) {
        return { cantidad: 0, total: 0 };
      }

      await tx.liquidacion.updateMany({
        where: { id: { in: pendientes.map((item) => item.id) } },
        data: { estado: 'solicitada', fechaSolicitud: new Date() },
      });

      return {
        cantidad: pendientes.length,
        total: redondearDos(
          pendientes.reduce((suma, item) => suma + Number(item.montoNeto), 0)
        ),
      };
    });
  }

  async listar(filtros: {
    estado?: Liquidacion['estado'];
    page: number;
    limit: number;
  }): Promise<Liquidacion[]> {
    const liquidaciones = await this.db.liquidacion.findMany({
      where: {
        ...(filtros.estado ? { estado: filtros.estado } : {}),
      },
      orderBy: { fechaCreacion: 'desc' },
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    });
    return liquidaciones.map(toLiquidacion);
  }

  async contar(filtros: { estado?: Liquidacion['estado'] }): Promise<number> {
    return this.db.liquidacion.count({
      where: {
        ...(filtros.estado ? { estado: filtros.estado } : {}),
      },
    });
  }

  async obtenerPorId(id: number): Promise<Liquidacion | null> {
    const liquidacion = await this.db.liquidacion.findUnique({ where: { id } });
    return liquidacion ? toLiquidacion(liquidacion) : null;
  }

  async aprobarRetiro(
    id: number,
    adminId: number,
    estado: Liquidacion['estado'],
    referencia: string | null,
    motivoRechazo: string | null = null
  ): Promise<Liquidacion> {
    // Un rechazo nunca puede hacer desaparecer el saldo del freelancer:
    // la liquidación vuelve a 'pendiente' y queda disponible para reintentar.
    const datos =
      estado === 'rechazada'
        ? {
            estado: 'pendiente',
            fechaSolicitud: null,
            fechaPago: null,
            referencia: null,
            motivoRechazo,
          }
        : {
            estado,
            fechaPago: new Date(),
            referencia,
            motivoRechazo: null,
          };

    const actualizada = await this.db.liquidacion.update({
      where: { id },
      data: datos,
    });
    return toLiquidacion(actualizada);
  }
}
