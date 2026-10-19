import { Prisma, PrismaClient } from '@prisma/client';
import {
  DatosOferta,
  EstadoOferta,
  FiltrosOferta,
  NuevaOferta,
  Oferta,
  OfertaPaginada,
} from '../../../domain/entities/Oferta';
import { PropuestaResumen } from '../../../domain/entities/Propuesta';
import { OfertaRepository } from '../../../domain/ports/repositories/OfertaRepository';

const ofertaInclude = {
  Categoria: true,
  ProyectoHabilidad: { include: { Habilidad: true } },
  _count: { select: { Propuesta: true } },
} satisfies Prisma.ProyectoInclude;

type ProyectoConRelaciones = Prisma.ProyectoGetPayload<{ include: typeof ofertaInclude }>;

function toOferta(proyecto: ProyectoConRelaciones): Oferta {
  return {
    id: proyecto.id,
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    presupuesto: proyecto.presupuesto === null ? null : Number(proyecto.presupuesto),
    plazoDias: proyecto.plazoDias,
    estado: proyecto.estado,
    imagenUrl: proyecto.imagenUrl,
    fechaPublicacion: proyecto.fechaPublicacion,
    categoria: proyecto.Categoria ? { id: proyecto.Categoria.id, nombre: proyecto.Categoria.nombre } : null,
    habilidades: proyecto.ProyectoHabilidad.map((ph) => ({ id: ph.Habilidad.id, nombre: ph.Habilidad.nombre })),
    totalPropuestas: proyecto._count.Propuesta,
  };
}

/** Adaptador Prisma del puerto OfertaRepository (modelo Proyecto). */
export class PrismaOfertaRepository implements OfertaRepository {
  constructor(private db: PrismaClient) {}

  async crear(clienteId: number, datos: NuevaOferta): Promise<Oferta> {
    // Proyecto.clienteId apunta a Cliente (no a User): aseguramos la fila Cliente
    // antes de crear la oferta, dentro de la misma transacción.
    const creada = await this.db.$transaction(async (tx) => {
      await tx.cliente.upsert({
        where: { id: clienteId },
        create: { id: clienteId },
        update: {},
      });
      return tx.proyecto.create({
        data: {
          clienteId,
          titulo: datos.titulo,
          descripcion: datos.descripcion,
          presupuesto: datos.presupuesto ?? null,
          plazoDias: datos.plazoDias ?? null,
          categoriaId: datos.categoriaId ?? null,
          imagenUrl: datos.imagenUrl ?? null,
          ...(datos.habilidadIds && datos.habilidadIds.length > 0
            ? { ProyectoHabilidad: { create: datos.habilidadIds.map((habilidadId) => ({ habilidadId })) } }
            : {}),
        },
        include: ofertaInclude,
      });
    });
    return toOferta(creada);
  }

  async listarPorCliente(clienteId: number, filtros: FiltrosOferta): Promise<OfertaPaginada> {
    const where: Prisma.ProyectoWhereInput = { clienteId };
    if (filtros.estado) {
      where.estado = filtros.estado;
    }
    if (filtros.texto) {
      where.OR = [
        { titulo: { contains: filtros.texto, mode: 'insensitive' } },
        { descripcion: { contains: filtros.texto, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.db.proyecto.count({ where }),
      this.db.proyecto.findMany({
        where,
        include: ofertaInclude,
        orderBy: { fechaPublicacion: 'desc' },
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
    ]);

    return { page: filtros.page, limit: filtros.limit, total, items: items.map(toOferta) };
  }

  async obtenerPorId(clienteId: number, ofertaId: number): Promise<Oferta | null> {
    const proyecto = await this.db.proyecto.findFirst({
      where: { id: ofertaId, clienteId },
      include: ofertaInclude,
    });
    return proyecto ? toOferta(proyecto) : null;
  }

  async actualizar(_clienteId: number, ofertaId: number, datos: DatosOferta): Promise<Oferta> {
    const data: Prisma.ProyectoUpdateInput = {};
    if (datos.titulo !== undefined) data.titulo = datos.titulo;
    if (datos.descripcion !== undefined) data.descripcion = datos.descripcion;
    if (datos.presupuesto !== undefined) data.presupuesto = datos.presupuesto;
    if (datos.plazoDias !== undefined) data.plazoDias = datos.plazoDias;
    if (datos.imagenUrl !== undefined) data.imagenUrl = datos.imagenUrl;
    if (datos.categoriaId !== undefined) {
      data.Categoria = datos.categoriaId === null ? { disconnect: true } : { connect: { id: datos.categoriaId } };
    }
    if (datos.habilidadIds !== undefined) {
      data.ProyectoHabilidad = {
        deleteMany: {},
        create: datos.habilidadIds.map((habilidadId) => ({ habilidadId })),
      };
    }

    const actualizada = await this.db.proyecto.update({
      where: { id: ofertaId },
      data,
      include: ofertaInclude,
    });
    return toOferta(actualizada);
  }

  async cambiarEstado(_clienteId: number, ofertaId: number, estado: EstadoOferta): Promise<Oferta> {
    const actualizada = await this.db.proyecto.update({
      where: { id: ofertaId },
      data: { estado },
      include: ofertaInclude,
    });
    return toOferta(actualizada);
  }

  async listarPropuestas(clienteId: number, ofertaId: number): Promise<PropuestaResumen[] | null> {
    const oferta = await this.db.proyecto.findFirst({
      where: { id: ofertaId, clienteId },
      select: { id: true },
    });
    if (!oferta) {
      return null;
    }

    const propuestas = await this.db.propuesta.findMany({
      where: { proyectoId: ofertaId },
      orderBy: { fechaEnvio: 'desc' },
      include: { Freelancer: { include: { User: true } } },
    });

    return propuestas.map((p) => ({
      id: p.id,
      mensaje: p.mensaje,
      montoPropuesto: Number(p.montoPropuesto),
      estado: p.estado,
      fechaEnvio: p.fechaEnvio,
      freelancer: {
        id: p.Freelancer.id,
        nombre: p.Freelancer.User.nombre,
        fotoPerfil: p.Freelancer.User.fotoPerfil,
        calificacionPromedio: Number(p.Freelancer.calificacionPromedio),
      },
    }));
  }

  async categoriaExiste(categoriaId: number): Promise<boolean> {
    const total = await this.db.categoria.count({ where: { id: categoriaId } });
    return total > 0;
  }

  async habilidadesValidas(habilidadIds: number[]): Promise<boolean> {
    const unicos = [...new Set(habilidadIds)];
    const total = await this.db.habilidad.count({ where: { id: { in: unicos } } });
    return total === unicos.length;
  }
}
