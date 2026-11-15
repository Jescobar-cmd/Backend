import { Prisma, PrismaClient } from '@prisma/client';
import {
  DetalleUsuarioModeracion,
  EstadoCuenta,
  FiltrosUsuarioModeracion,
  ResumenUsuarioModeracion,
  Sancion,
} from '../../../domain/entities/UsuarioModeracion';
import { UsuarioModeracionRepository } from '../../../domain/ports/repositories/UsuarioModeracionRepository';

const usuarioInclude = {
  Rol: { select: { nombre: true } },
  SuspendidoPor: { select: { nombre: true } },
} satisfies Prisma.UsuarioInclude;

type UsuarioConModeracion = Prisma.UsuarioGetPayload<{
  include: typeof usuarioInclude;
}>;

function aResumen(usuario: UsuarioConModeracion): ResumenUsuarioModeracion {
  const suspendido = usuario.estado === 'suspendido';
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rolId: usuario.rolId,
    rol: usuario.Rol?.nombre ?? '',
    estado: usuario.estado as EstadoCuenta,
    fotoPerfil: usuario.fotoPerfil,
    fechaRegistro: usuario.fechaRegistro,
    suspension:
      suspendido && usuario.fechaSuspension
        ? {
            motivo: usuario.motivoSuspension,
            fecha: usuario.fechaSuspension,
            por: usuario.SuspendidoPor?.nombre ?? null,
          }
        : null,
  };
}

/** Adaptador Prisma del puerto UsuarioModeracionRepository. */
export class PrismaUsuarioModeracionRepository
  implements UsuarioModeracionRepository
{
  constructor(private db: PrismaClient) {}

  async listar(
    filtros: FiltrosUsuarioModeracion
  ): Promise<{ items: ResumenUsuarioModeracion[]; total: number }> {
    const where: Prisma.UsuarioWhereInput = {};
    if (filtros.texto) {
      where.OR = [
        { nombre: { contains: filtros.texto, mode: 'insensitive' } },
        { email: { contains: filtros.texto, mode: 'insensitive' } },
      ];
    }
    if (filtros.rolId) {
      where.rolId = filtros.rolId;
    }
    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    const [items, total] = await Promise.all([
      this.db.usuario.findMany({
        where,
        include: usuarioInclude,
        orderBy: { fechaRegistro: 'desc' },
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
      this.db.usuario.count({ where }),
    ]);

    return { items: items.map(aResumen), total };
  }

  async obtenerDetalle(id: number): Promise<DetalleUsuarioModeracion | null> {
    const usuario = await this.db.usuario.findUnique({
      where: { id },
      include: {
        ...usuarioInclude,
        Freelancer: { select: { calificacionPromedio: true } },
        SancionesRecibidas: {
          include: {
            Moderador: { select: { id: true, nombre: true } },
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });
    if (!usuario) return null;

    const [totalContratos, totalPublicaciones] = await Promise.all([
      this.db.contrato.count({
        where: { OR: [{ clienteId: id }, { freelancerId: id }] },
      }),
      Promise.all([
        this.db.servicio.count({ where: { freelancerId: id } }),
        this.db.proyecto.count({ where: { clienteId: id } }),
        this.db.publicacion.count({ where: { autorId: id } }),
      ]).then(([servicios, proyectos, publicaciones]) =>
        servicios + proyectos + publicaciones
      ),
    ]);

    const sanciones: Sancion[] = usuario.SancionesRecibidas.map((sancion) => ({
      id: sancion.id,
      tipo: sancion.tipo,
      motivo: sancion.motivo,
      fecha: sancion.fecha,
      moderador: sancion.Moderador
        ? { id: sancion.Moderador.id, nombre: sancion.Moderador.nombre }
        : null,
    }));

    return {
      ...aResumen(usuario),
      telefono: usuario.telefono,
      cedula: usuario.cedula,
      calificacionPromedio:
        usuario.Freelancer === null
          ? null
          : Number(usuario.Freelancer.calificacionPromedio),
      totalContratos,
      totalPublicaciones,
      sanciones,
    };
  }

  async registrarSancion(datos: {
    usuarioId: number;
    moderadorId: number;
    tipo: string;
    motivo: string;
  }): Promise<void> {
    await this.db.sancionUsuario.create({
      data: {
        usuarioId: datos.usuarioId,
        moderadorId: datos.moderadorId,
        tipo: datos.tipo,
        motivo: datos.motivo,
      },
    });
  }
}
