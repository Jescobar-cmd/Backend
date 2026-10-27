import { PrismaClient } from '@prisma/client';
import { ContratoDetalle, EstadoContratoFinal } from '../../../domain/entities/Contrato';
import { ContratoRepository } from '../../../domain/ports/repositories/ContratoRepository';
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
