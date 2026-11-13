import { PrismaClient } from '@prisma/client';
import { ContratoDetalle, EstadoContratoFinal } from '../../../domain/entities/Contrato';
import { ContratoRepository } from '../../../domain/ports/repositories/ContratoRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
} from '../../../shared/errors/ErrorAplicacion';
import { contratoInclude, toContratoDetalle } from './contratoInclude';

/** Adaptador Prisma del puerto ContratoRepository. */
export class PrismaContratoRepository implements ContratoRepository {
  constructor(private db: PrismaClient) {}

  async listar(usuarioId: number): Promise<ContratoDetalle[]> {
    const contratos = await this.db.contrato.findMany({
      where: { OR: [{ clienteId: usuarioId }, { freelancerId: usuarioId }] },
      include: contratoInclude,
      orderBy: { id: 'desc' },
    });
    return contratos.map(toContratoDetalle);
  }

  async obtener(contratoId: number): Promise<ContratoDetalle | null> {
    const contrato = await this.db.contrato.findUnique({
      where: { id: contratoId },
      include: contratoInclude,
    });
    return contrato ? toContratoDetalle(contrato) : null;
  }

  async crearCompraDirecta(
    clienteId: number,
    servicioId: number,
    montoPagoCliente: number
  ): Promise<ContratoDetalle> {
    const contrato = await this.db.$transaction(async (tx) => {
      await tx.cliente.upsert({
        where: { id: clienteId },
        create: { id: clienteId },
        update: {},
      });

      const servicio = await tx.servicio.findUnique({
        where: { id: servicioId },
        select: { freelancerId: true, precio: true, estado: true },
      });
      if (!servicio) {
        throw new ErrorNoEncontrado('Servicio no encontrado');
      }
      if (servicio.estado !== 'activo') {
        throw new ErrorConflicto('El servicio no está disponible');
      }

      return tx.contrato.create({
        data: {
          clienteId,
          freelancerId: servicio.freelancerId,
          servicioId,
          montoAcordado: servicio.precio,
          fechaInicio: new Date(),
          estado: 'activo',
          Pago: {
            create: {
              monto: montoPagoCliente,
              metodoPago: 'mercado_pago',
              estado: 'pendiente',
              Factura: {
                create: {
                  estado: 'pendiente',
                },
              },
            },
          },
        },
        include: contratoInclude,
      });
    });

    return toContratoDetalle(contrato);
  }

  async existeActivoPorServicio(
    clienteId: number,
    servicioId: number
  ): Promise<boolean> {
    const total = await this.db.contrato.count({
      where: { clienteId, servicioId, estado: 'activo' },
    });
    return total > 0;
  }

  async cambiarEstado(
    contratoId: number,
    estado: EstadoContratoFinal
  ): Promise<ContratoDetalle> {
    const contrato = await this.db.$transaction(async (tx) => {
      const actualizado = await tx.contrato.update({
        where: { id: contratoId },
        data: { estado, fechaFin: new Date() },
        include: contratoInclude,
      });

      // Si el contrato viene de una oferta, la oferta refleja el cierre.
      if (actualizado.proyectoId) {
        await tx.proyecto.update({
          where: { id: actualizado.proyectoId },
          data: { estado },
        });
      }

      return actualizado;
    });

    return toContratoDetalle(contrato);
  }
}
