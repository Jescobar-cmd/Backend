import { Prisma, PrismaClient } from '@prisma/client';
import { Proyecto } from '../../../domain/entities/Proyecto';
import {
  FiltrosProyecto,
  ProyectoRepository,
} from '../../../domain/ports/repositories/ProyectoRepository';

const proyectoInclude = {
  Cliente: { include: { Usuario: true } },
  Categoria: true,
} satisfies Prisma.ProyectoInclude;

type ProyectoConRelaciones = Prisma.ProyectoGetPayload<{
  include: typeof proyectoInclude;
}>;

function toEntidad(proyecto: ProyectoConRelaciones): Proyecto {
  const usuario = proyecto.Cliente?.Usuario;
  return {
    id: proyecto.id,
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    presupuesto: proyecto.presupuesto === null ? null : Number(proyecto.presupuesto),
    estado: proyecto.estado,
    fechaPublicacion: proyecto.fechaPublicacion,
    clienteId: proyecto.clienteId,
    categoriaId: proyecto.categoriaId,
    moderacionRetirada: proyecto.moderacionRetirada,
    moderacionEstadoAnterior: proyecto.moderacionEstadoAnterior,
    moderacionMotivo: proyecto.moderacionMotivo,
    cliente: usuario
      ? {
          id: usuario.id,
          nombre: usuario.nombre,
          fotoPerfil: usuario.fotoPerfil,
          estado: usuario.estado,
        }
      : null,
    categoria: proyecto.Categoria
      ? { id: proyecto.Categoria.id, nombre: proyecto.Categoria.nombre }
      : null,
  };
}

function construirWhere(filtros: Pick<FiltrosProyecto, 'estado' | 'texto'>): Prisma.ProyectoWhereInput {
  const where: Prisma.ProyectoWhereInput = {};
  if (filtros.estado) {
    where.estado = filtros.estado;
  }
  if (filtros.texto) {
    where.OR = [
      { titulo: { contains: filtros.texto, mode: 'insensitive' } },
      { descripcion: { contains: filtros.texto, mode: 'insensitive' } },
    ];
  }
  return where;
}

/** Adaptador Prisma del puerto ProyectoRepository (proyectos del cliente). */
export class PrismaProyectoRepository implements ProyectoRepository {
  constructor(private db: PrismaClient) {}

  async obtenerPorId(id: number): Promise<Proyecto | null> {
    const registro = await this.db.proyecto.findUnique({
      where: { id },
      include: proyectoInclude,
    });
    return registro ? toEntidad(registro) : null;
  }

  async listar(
    filtros: FiltrosProyecto
  ): Promise<{ items: Proyecto[]; total: number }> {
    const where = construirWhere(filtros);
    const [items, total] = await Promise.all([
      this.db.proyecto.findMany({
        where,
        include: proyectoInclude,
        orderBy: { fechaPublicacion: 'desc' },
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
      this.db.proyecto.count({ where }),
    ]);
    return { items: items.map(toEntidad), total };
  }

  async cambiarEstado(proyectoId: number, estado: string): Promise<Proyecto> {
    const actualizado = await this.db.proyecto.update({
      where: { id: proyectoId },
      data: { estado },
      include: proyectoInclude,
    });
    return toEntidad(actualizado);
  }

  async actualizarModeracion(
    proyectoId: number,
    datos: {
      moderacionRetirada: boolean;
      moderacionEstadoAnterior: string | null;
      moderacionMotivo: string | null;
    }
  ): Promise<Proyecto> {
    const actualizado = await this.db.proyecto.update({
      where: { id: proyectoId },
      data: {
        moderacionRetirada: datos.moderacionRetirada,
        moderacionEstadoAnterior: datos.moderacionEstadoAnterior,
        moderacionMotivo: datos.moderacionMotivo,
      },
      include: proyectoInclude,
    });
    return toEntidad(actualizado);
  }
}
