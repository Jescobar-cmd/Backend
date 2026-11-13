import { PrismaClient } from '@prisma/client';
import {
  Disputa,
  EstadoDisputa,
  NuevaDisputa,
} from '../../../domain/entities/Disputa';
import { DisputaRepository } from '../../../domain/ports/repositories/DisputaRepository';

function toDisputa(disputa: {
  id: number;
  contratoId: number;
  abiertaPorId: number;
  motivo: string;
  descripcion: string;
  evidenciaUrl: string | null;
  estado: string;
  resolucion: string | null;
  resueltaPorId: number | null;
  fechaApertura: Date;
  fechaResolucion: Date | null;
}): Disputa {
  return {
    id: disputa.id,
    contratoId: disputa.contratoId,
    abiertaPorId: disputa.abiertaPorId,
    motivo: disputa.motivo,
    descripcion: disputa.descripcion,
    evidenciaUrl: disputa.evidenciaUrl,
    estado: disputa.estado as EstadoDisputa,
    resolucion: disputa.resolucion,
    resueltaPorId: disputa.resueltaPorId,
    fechaApertura: disputa.fechaApertura,
    fechaResolucion: disputa.fechaResolucion,
  };
}

/** Adaptador Prisma del puerto DisputaRepository. */
export class PrismaDisputaRepository implements DisputaRepository {
  constructor(private db: PrismaClient) {}

  async crear(datos: NuevaDisputa): Promise<Disputa> {
    const creada = await this.db.disputa.create({
      data: {
        contratoId: datos.contratoId,
        abiertaPorId: datos.abiertaPorId,
        motivo: datos.motivo,
        descripcion: datos.descripcion,
        evidenciaUrl: datos.evidenciaUrl ?? null,
      },
    });
    return toDisputa(creada);
  }

  async listarPorContrato(contratoId: number): Promise<Disputa[]> {
    const disputas = await this.db.disputa.findMany({
      where: { contratoId },
      orderBy: { fechaApertura: 'desc' },
    });
    return disputas.map(toDisputa);
  }

  async existeAbierta(contratoId: number): Promise<boolean> {
    const total = await this.db.disputa.count({
      where: { contratoId, estado: { in: ['abierta', 'en_revision'] } },
    });
    return total > 0;
  }
}
