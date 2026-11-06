import { Prisma, PrismaClient, PortafolioItem as PrismaPortafolioItem } from '@prisma/client';
import {
  DatosPortafolioItem,
  NuevoPortafolioItem,
  PortafolioItem,
} from '../../../domain/entities/PortafolioItem';
import { PortafolioRepository } from '../../../domain/ports/repositories/PortafolioRepository';

function toPortafolioItem(item: PrismaPortafolioItem): PortafolioItem {
  return {
    id: item.id,
    freelancerId: item.freelancerId,
    titulo: item.titulo,
    descripcion: item.descripcion,
    imagenUrl: item.imagenUrl,
    enlaceUrl: item.enlaceUrl,
    fechaCreacion: item.fechaCreacion,
  };
}

/** Adaptador Prisma del portafolio. */
export class PrismaPortafolioRepository implements PortafolioRepository {
  constructor(private db: PrismaClient) {}

  async listarPorFreelancer(freelancerId: number): Promise<PortafolioItem[]> {
    const items = await this.db.portafolioItem.findMany({
      where: { freelancerId },
      orderBy: { fechaCreacion: 'desc' },
    });
    return items.map(toPortafolioItem);
  }

  async obtenerPorId(itemId: number): Promise<PortafolioItem | null> {
    const item = await this.db.portafolioItem.findUnique({ where: { id: itemId } });
    return item ? toPortafolioItem(item) : null;
  }

  async crear(freelancerId: number, datos: NuevoPortafolioItem): Promise<PortafolioItem> {
    const item = await this.db.$transaction(async (tx) => {
      // PortafolioItem.freelancerId apunta a Freelancer (no a Usuario).
      await tx.freelancer.upsert({
        where: { id: freelancerId },
        create: { id: freelancerId },
        update: {},
      });
      return tx.portafolioItem.create({
        data: {
          freelancerId,
          titulo: datos.titulo,
          descripcion: datos.descripcion ?? null,
          imagenUrl: datos.imagenUrl ?? null,
          enlaceUrl: datos.enlaceUrl ?? null,
        },
      });
    });
    return toPortafolioItem(item);
  }

  async actualizar(itemId: number, datos: DatosPortafolioItem): Promise<PortafolioItem> {
    const data: Prisma.PortafolioItemUpdateInput = {};
    if (datos.titulo !== undefined) data.titulo = datos.titulo;
    if (datos.descripcion !== undefined) data.descripcion = datos.descripcion;
    if (datos.imagenUrl !== undefined) data.imagenUrl = datos.imagenUrl;
    if (datos.enlaceUrl !== undefined) data.enlaceUrl = datos.enlaceUrl;

    const item = await this.db.portafolioItem.update({
      where: { id: itemId },
      data,
    });
    return toPortafolioItem(item);
  }

  async eliminar(itemId: number): Promise<void> {
    await this.db.portafolioItem.delete({ where: { id: itemId } });
  }
}
