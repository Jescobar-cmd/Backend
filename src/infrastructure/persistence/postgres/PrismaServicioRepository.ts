import { Prisma, PrismaClient } from '@prisma/client';
import {
  DatosServicio,
  EstadoServicio,
  FiltrosServicio,
  NuevoServicio,
  Servicio,
  ServicioPaginado,
} from '../../../domain/entities/Servicio';
import { ServicioRepository } from '../../../domain/ports/repositories/ServicioRepository';

const servicioInclude = {
  Categoria: true,
  Freelancer: { include: { User: true } },
} satisfies Prisma.ServicioInclude;

type ServicioConRelaciones = Prisma.ServicioGetPayload<{ include: typeof servicioInclude }>;

function toServicio(servicio: ServicioConRelaciones): Servicio {
  return {
    id: servicio.id,
    titulo: servicio.titulo,
    descripcion: servicio.descripcion,
    precio: Number(servicio.precio),
    imagenUrl: servicio.imagenUrl,
    estado: servicio.estado,
    fechaCreacion: servicio.fechaCreacion,
    categoria: servicio.Categoria
      ? { id: servicio.Categoria.id, nombre: servicio.Categoria.nombre }
      : null,
    freelancer: {
      id: servicio.Freelancer.id,
      nombre: servicio.Freelancer.User.nombre,
      fotoPerfil: servicio.Freelancer.User.fotoPerfil,
      tituloProfesional: servicio.Freelancer.tituloProfesional,
      calificacionPromedio: Number(servicio.Freelancer.calificacionPromedio),
    },
  };
}

/** Adaptador Prisma del puerto ServicioRepository. */
export class PrismaServicioRepository implements ServicioRepository {
  constructor(private db: PrismaClient) {}

  async crear(freelancerId: number, datos: NuevoServicio): Promise<Servicio> {
    // Servicio.freelancerId apunta a Freelancer (no a User): aseguramos la fila
    // antes de crear el servicio, dentro de la misma transacción.
    const creado = await this.db.$transaction(async (tx) => {
      await tx.freelancer.upsert({
        where: { id: freelancerId },
        create: { id: freelancerId },
        update: {},
      });
      return tx.servicio.create({
        data: {
          freelancerId,
          titulo: datos.titulo,
          descripcion: datos.descripcion,
          precio: datos.precio,
          categoriaId: datos.categoriaId ?? null,
          imagenUrl: datos.imagenUrl ?? null,
        },
        include: servicioInclude,
      });
    });
    return toServicio(creado);
  }

  async listar(filtros: FiltrosServicio): Promise<ServicioPaginado> {
    const where: Prisma.ServicioWhereInput = { estado: 'activo' };
    if (filtros.categoriaId) {
      where.categoriaId = filtros.categoriaId;
    }
    if (filtros.texto) {
      where.OR = [
        { titulo: { contains: filtros.texto, mode: 'insensitive' } },
        { descripcion: { contains: filtros.texto, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.db.servicio.count({ where }),
      this.db.servicio.findMany({
        where,
        include: servicioInclude,
        orderBy: { fechaCreacion: 'desc' },
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
    ]);

    return { page: filtros.page, limit: filtros.limit, total, items: items.map(toServicio) };
  }

  async listarPorFreelancer(
    freelancerId: number,
    filtros: FiltrosServicio
  ): Promise<ServicioPaginado> {
    const where: Prisma.ServicioWhereInput = { freelancerId };
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
      this.db.servicio.count({ where }),
      this.db.servicio.findMany({
        where,
        include: servicioInclude,
        orderBy: { fechaCreacion: 'desc' },
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
    ]);

    return { page: filtros.page, limit: filtros.limit, total, items: items.map(toServicio) };
  }

  async obtenerPorId(servicioId: number): Promise<Servicio | null> {
    const servicio = await this.db.servicio.findUnique({
      where: { id: servicioId },
      include: servicioInclude,
    });
    return servicio ? toServicio(servicio) : null;
  }

  async actualizar(servicioId: number, datos: DatosServicio): Promise<Servicio> {
    const data: Prisma.ServicioUpdateInput = {};
    if (datos.titulo !== undefined) data.titulo = datos.titulo;
    if (datos.descripcion !== undefined) data.descripcion = datos.descripcion;
    if (datos.precio !== undefined) data.precio = datos.precio;
    if (datos.imagenUrl !== undefined) data.imagenUrl = datos.imagenUrl;
    if (datos.categoriaId !== undefined) {
      data.Categoria =
        datos.categoriaId === null
          ? { disconnect: true }
          : { connect: { id: datos.categoriaId } };
    }

    const actualizado = await this.db.servicio.update({
      where: { id: servicioId },
      data,
      include: servicioInclude,
    });
    return toServicio(actualizado);
  }

  async cambiarEstado(servicioId: number, estado: EstadoServicio): Promise<Servicio> {
    const actualizado = await this.db.servicio.update({
      where: { id: servicioId },
      data: { estado },
      include: servicioInclude,
    });
    return toServicio(actualizado);
  }

  async categoriaExiste(categoriaId: number): Promise<boolean> {
    const total = await this.db.categoria.count({ where: { id: categoriaId } });
    return total > 0;
  }
}
