import { PrismaClient } from '@prisma/client';
import { Categoria } from '../../../domain/entities/Categoria';
import { CategoriaRepository } from '../../../domain/ports/repositories/CategoriaRepository';

/** Adaptador Prisma del catálogo de categorías. */
export class PrismaCategoriaRepository implements CategoriaRepository {
  constructor(private db: PrismaClient) {}

  async listar(): Promise<Categoria[]> {
    const categorias = await this.db.categoria.findMany({ orderBy: { nombre: 'asc' } });
    return categorias.map((c) => ({ id: c.id, nombre: c.nombre, descripcion: c.descripcion }));
  }
}
