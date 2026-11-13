import { PrismaClient } from '@prisma/client';
import {
  EntregaContrato,
  EstadoEntrega,
  NuevaEntregaContrato,
} from '../../../domain/entities/EntregaContrato';
import { EntregaContratoRepository } from '../../../domain/ports/repositories/EntregaContratoRepository';

function toEntrega(entrega: {
  id: number;
  contratoId: number;
  autorId: number;
  mensaje: string | null;
  archivoUrl: string | null;
  enlaceUrl: string | null;
  estado: string;
  fechaEntrega: Date;
  fechaRevision: Date | null;
  revisadoPorId: number | null;
}): EntregaContrato {
  return {
    id: entrega.id,
    contratoId: entrega.contratoId,
    autorId: entrega.autorId,
    mensaje: entrega.mensaje,
    archivoUrl: entrega.archivoUrl,
    enlaceUrl: entrega.enlaceUrl,
    estado: entrega.estado as EstadoEntrega,
    fechaEntrega: entrega.fechaEntrega,
    fechaRevision: entrega.fechaRevision,
    revisadoPorId: entrega.revisadoPorId,
  };
}

/** Adaptador Prisma del puerto EntregaContratoRepository. */
export class PrismaEntregaContratoRepository implements EntregaContratoRepository {
  constructor(private db: PrismaClient) {}

  async crear(datos: NuevaEntregaContrato): Promise<EntregaContrato> {
    const creada = await this.db.entregaContrato.create({
      data: {
        contratoId: datos.contratoId,
        autorId: datos.autorId,
        mensaje: datos.mensaje ?? null,
        archivoUrl: datos.archivoUrl ?? null,
        enlaceUrl: datos.enlaceUrl ?? null,
      },
    });
    return toEntrega(creada);
  }

  async listarPorContrato(contratoId: number): Promise<EntregaContrato[]> {
    const entregas = await this.db.entregaContrato.findMany({
      where: { contratoId },
      orderBy: { fechaEntrega: 'desc' },
    });
    return entregas.map(toEntrega);
  }

  async obtenerPendiente(contratoId: number): Promise<EntregaContrato | null> {
    const entrega = await this.db.entregaContrato.findFirst({
      where: { contratoId, estado: 'enviada' },
      orderBy: { fechaEntrega: 'desc' },
    });
    return entrega ? toEntrega(entrega) : null;
  }

  async aprobar(entregaId: number, revisorId: number): Promise<EntregaContrato> {
    const entrega = await this.db.entregaContrato.update({
      where: { id: entregaId },
      data: {
        estado: 'aprobada',
        fechaRevision: new Date(),
        revisadoPorId: revisorId,
      },
    });
    return toEntrega(entrega);
  }
}
