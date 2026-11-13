import { PrismaClient } from '@prisma/client';
import { DashboardClienteDatos } from '../../../domain/entities/DashboardCliente';
import { DashboardClienteRepository } from '../../../domain/ports/repositories/DashboardClienteRepository';
import { contratoInclude, toContratoDetalle } from './contratoInclude';

/** Adaptador de lectura para el resumen del panel del cliente. */
export class PrismaDashboardClienteRepository implements DashboardClienteRepository {
  constructor(private db: PrismaClient) {}

  async obtener(clienteId: number): Promise<DashboardClienteDatos> {
    const [
      contratosActivos,
      contratosCompletados,
      contratosCancelados,
      entregasPendientes,
      disputasAbiertas,
      pagosPendientes,
      totalPagado,
      notificacionesSinLeer,
      contratosRecientes,
    ] = await Promise.all([
      this.db.contrato.count({ where: { clienteId, estado: 'activo' } }),
      this.db.contrato.count({ where: { clienteId, estado: 'completado' } }),
      this.db.contrato.count({ where: { clienteId, estado: 'cancelado' } }),
      this.db.entregaContrato.count({
        where: { estado: 'enviada', Contrato: { clienteId } },
      }),
      this.db.disputa.count({
        where: {
          estado: { in: ['abierta', 'en_revision'] },
          Contrato: { clienteId },
        },
      }),
      this.db.pago.count({
        where: { estado: 'pendiente', Contrato: { clienteId } },
      }),
      this.db.pago.aggregate({
        where: { estado: 'pagado', Contrato: { clienteId } },
        _sum: { monto: true },
      }),
      this.db.notificacion.count({
        where: { usuarioId: clienteId, leida: false },
      }),
      this.db.contrato.findMany({
        where: { clienteId },
        include: contratoInclude,
        orderBy: { id: 'desc' },
        take: 5,
      }),
    ]);

    return {
      contratosActivos,
      contratosCompletados,
      contratosCancelados,
      entregasPendientes,
      disputasAbiertas,
      pagosPendientes,
      totalPagado: Number(totalPagado._sum.monto ?? 0),
      notificacionesSinLeer,
      contratosRecientes: contratosRecientes.map(toContratoDetalle),
    };
  }
}
