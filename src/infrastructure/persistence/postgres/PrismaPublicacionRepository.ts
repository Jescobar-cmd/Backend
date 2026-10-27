import { Prisma, PrismaClient } from '@prisma/client';
import {
  FiltrosPublicacion,
  NuevaPublicacion,
  Publicacion,
  PublicacionPaginada,
} from '../../../domain/entities/Publicacion';
import { PublicacionRepository } from '../../../domain/ports/repositories/PublicacionRepository';

const publicacionInclude = {
  Autor: true,
  _count: { select: { MeGustaPublicacion: true } },
  MeGustaPublicacion: { select: { usuarioId: true } },
} satisfies Prisma.PublicacionInclude;

type PublicacionConRelaciones = Prisma.PublicacionGetPayload<{
  include: typeof publicacionInclude;
}>;

function toPublicacion(publicacion: PublicacionConRelaciones): Publicacion {
  return {
    id: publicacion.id,
    titulo: publicacion.titulo,
    contenido: publicacion.contenido,
    imagenUrl: publicacion.imagenUrl,
    fechaPublicacion: publicacion.fechaPublicacion,
    autor: {
      id: publicacion.Autor.id,
      nombre: publicacion.Autor.nombre,
      fotoPerfil: publicacion.Autor.fotoPerfil,
      rol: publicacion.Autor.rolId,
    },
    likes: {
      total: publicacion._count.MeGustaPublicacion,
      meGusta: publicacion.MeGustaPublicacion.length > 0,
    },
  };
}

/** Adaptador Prisma del puerto PublicacionRepository (blog). */
export class PrismaPublicacionRepository implements PublicacionRepository {
  constructor(private db: PrismaClient) {}

  async crear(autorId: number, datos: NuevaPublicacion): Promise<Publicacion> {
    const creada = await this.db.publicacion.create({
      data: {
        autorId,
        titulo: datos.titulo ?? null,
        contenido: datos.contenido,
        imagenUrl: datos.imagenUrl ?? null,
      },
      include: publicacionInclude,
    });
    return toPublicacion(creada);
  }

  async listar(filtros: FiltrosPublicacion, usuarioId: number): Promise<PublicacionPaginada> {
    const where: Prisma.PublicacionWhereInput = { estado: 'publicado' };
    if (filtros.autorId) {
      where.autorId = filtros.autorId;
    }

    const [total, items] = await Promise.all([
      this.db.publicacion.count({ where }),
      this.db.publicacion.findMany({
        where,
        include: {
          ...publicacionInclude,
          MeGustaPublicacion: { where: { usuarioId }, select: { usuarioId: true } },
        },
        orderBy: { fechaPublicacion: 'desc' },
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
    ]);

    return { page: filtros.page, limit: filtros.limit, total, items: items.map(toPublicacion) };
  }

  async obtenerPorId(publicacionId: number, usuarioId: number): Promise<Publicacion | null> {
    const publicacion = await this.db.publicacion.findFirst({
      where: { id: publicacionId, estado: 'publicado' },
      include: {
        ...publicacionInclude,
        MeGustaPublicacion: { where: { usuarioId }, select: { usuarioId: true } },
      },
    });
    return publicacion ? toPublicacion(publicacion) : null;
  }

  async eliminar(publicacionId: number): Promise<void> {
    await this.db.publicacion.update({
      where: { id: publicacionId },
      data: { estado: 'eliminado' },
    });
  }

  async alternarMeGusta(
    publicacionId: number,
    usuarioId: number
  ): Promise<{ meGusta: boolean; totalLikes: number } | null> {
    const publicacion = await this.db.publicacion.findFirst({
      where: { id: publicacionId, estado: 'publicado' },
      select: { id: true },
    });
    if (!publicacion) {
      return null;
    }

    const clave = { publicacionId_usuarioId: { publicacionId, usuarioId } };
    const existente = await this.db.meGustaPublicacion.findUnique({ where: clave });

    if (existente) {
      await this.db.meGustaPublicacion.delete({ where: clave });
    } else {
      await this.db.meGustaPublicacion.create({ data: { publicacionId, usuarioId } });
    }

    const totalLikes = await this.db.meGustaPublicacion.count({ where: { publicacionId } });
    return { meGusta: !existente, totalLikes };
  }
}
