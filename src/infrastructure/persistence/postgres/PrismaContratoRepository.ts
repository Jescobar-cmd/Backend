import { PrismaClient } from '@prisma/client';
import { ContratoDetalle } from '../../../domain/entities/Contrato';
import { ContratoRepository } from '../../../domain/ports/repositories/ContratoRepository';
import { contratoInclude, toContratoDetalle } from './contratoInclude';

/** Adaptador Prisma del puerto ContratoRepository (lectura mínima). */
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
}
