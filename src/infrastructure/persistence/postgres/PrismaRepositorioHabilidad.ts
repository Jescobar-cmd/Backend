import { Prisma, PrismaClient } from '@prisma/client';
import { Habilidad } from '../../../domain/entities/Habilidad';
import { HabilidadRepository } from '../../../domain/ports/repositories/HabilidadRepository';

const habilidadInclude = {
  Categoria: { select: { id: true, nombre: true } },
} satisfies Prisma.HabilidadInclude;

type HabilidadConCategoria = Prisma.HabilidadGetPayload<{
  include: typeof habilidadInclude;
}>;

function aHabilidad(habilidad: HabilidadConCategoria): Habilidad {
  return {
    id: habilidad.id,
    nombre: habilidad.nombre,
    categoriaId: habilidad.categoriaId,
    categoria: habilidad.Categoria
      ? { id: habilidad.Categoria.id, nombre: habilidad.Categoria.nombre }
      : null,
  };
}

/** Adaptador Prisma del catálogo de habilidades. */
export class PrismaRepositorioHabilidad implements HabilidadRepository {
  constructor(private db: PrismaClient) {}

  async listar(): Promise<Habilidad[]> {
    const habilidades = await this.db.habilidad.findMany({
      include: habilidadInclude,
      orderBy: { nombre: 'asc' },
    });
    return habilidades.map(aHabilidad);
  }

  async buscarPorIds(ids: number[]): Promise<Habilidad[]> {
    if (ids.length === 0) return [];
    const habilidades = await this.db.habilidad.findMany({
      where: { id: { in: ids } },
      include: habilidadInclude,
    });
    return habilidades.map(aHabilidad);
  }
}
