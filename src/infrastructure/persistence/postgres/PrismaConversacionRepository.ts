import { Prisma, PrismaClient } from '@prisma/client';
import {
  ConversacionContexto,
  ConversacionDetalle,
  ConversacionResumen,
  Mensaje,
} from '../../../domain/entities/Conversacion';
import {
  ContextoConversacion,
  ConversacionRepository,
} from '../../../domain/ports/repositories/ConversacionRepository';
import { ROLES } from '../../../shared/constants/roles';

const conversacionDetalleInclude = {
  Cliente: { include: { Usuario: true } },
  Freelancer: { include: { Usuario: true } },
  Proyecto: { select: { id: true, titulo: true } },
  Servicio: { select: { id: true, titulo: true } },
} satisfies Prisma.ConversacionInclude;

type ConversacionConDetalle = Prisma.ConversacionGetPayload<{
  include: typeof conversacionDetalleInclude;
}>;

const mensajeInclude = { OfertaChat: true } satisfies Prisma.MensajeInclude;
type MensajeConOferta = Prisma.MensajeGetPayload<{ include: typeof mensajeInclude }>;

function toContexto(conv: ConversacionConDetalle): ConversacionContexto {
  if (conv.Proyecto) {
    return { tipo: 'proyecto', id: conv.Proyecto.id, titulo: conv.Proyecto.titulo };
  }
  if (conv.Servicio) {
    return { tipo: 'servicio', id: conv.Servicio.id, titulo: conv.Servicio.titulo };
  }
  return { tipo: 'ninguno', id: null, titulo: null };
}

function toDetalle(conv: ConversacionConDetalle): ConversacionDetalle {
  return {
    id: conv.id,
    fechaCreacion: conv.fechaCreacion,
    contexto: toContexto(conv),
    cliente: {
      id: conv.Cliente.id,
      nombre: conv.Cliente.Usuario.nombre,
      fotoPerfil: conv.Cliente.Usuario.fotoPerfil,
    },
    freelancer: {
      id: conv.Freelancer.id,
      nombre: conv.Freelancer.Usuario.nombre,
      fotoPerfil: conv.Freelancer.Usuario.fotoPerfil,
    },
  };
}

function toMensaje(mensaje: MensajeConOferta): Mensaje {
  return {
    id: mensaje.id,
    emisorId: mensaje.emisorId,
    contenido: mensaje.contenido,
    tipo: mensaje.tipo,
    fechaEnvio: mensaje.fechaEnvio,
    leido: mensaje.leido,
    oferta: mensaje.OfertaChat
      ? {
          id: mensaje.OfertaChat.id,
          monto: Number(mensaje.OfertaChat.monto),
          descripcion: mensaje.OfertaChat.descripcion,
          estado: mensaje.OfertaChat.estado,
          fechaExpiracion: mensaje.OfertaChat.fechaExpiracion,
        }
      : null,
  };
}

/** Adaptador Prisma del puerto ConversacionRepository. */
export class PrismaConversacionRepository implements ConversacionRepository {
  constructor(private db: PrismaClient) {}

  async crearOEncontrar(
    clienteId: number,
    freelancerId: number,
    contexto: ContextoConversacion
  ): Promise<ConversacionDetalle> {
    const proyectoId = contexto.proyectoId ?? null;
    const servicioId = contexto.servicioId ?? null;

    const conversacion = await this.db.$transaction(async (tx) => {
      // Conversacion apunta a Cliente y Freelancer (no a Usuario): aseguramos ambas filas.
      await tx.cliente.upsert({
        where: { id: clienteId },
        create: { id: clienteId },
        update: {},
      });
      await tx.freelancer.upsert({
        where: { id: freelancerId },
        create: { id: freelancerId },
        update: {},
      });

      const existente =
        proyectoId !== null
          ? await tx.conversacion.findUnique({
              where: {
                proyectoId_clienteId_freelancerId: {
                  proyectoId,
                  clienteId,
                  freelancerId,
                },
              },
              include: conversacionDetalleInclude,
            })
          : await tx.conversacion.findFirst({
              where: { servicioId, clienteId, freelancerId },
              include: conversacionDetalleInclude,
            });

      if (existente) {
        return existente;
      }

      return tx.conversacion.create({
        data: { clienteId, freelancerId, proyectoId, servicioId },
        include: conversacionDetalleInclude,
      });
    });

    return toDetalle(conversacion);
  }

  async listar(usuarioId: number): Promise<ConversacionResumen[]> {
    const conversaciones = await this.db.conversacion.findMany({
      where: { OR: [{ clienteId: usuarioId }, { freelancerId: usuarioId }] },
      include: {
        ...conversacionDetalleInclude,
        Mensaje: { orderBy: { fechaEnvio: 'desc' }, take: 1 },
        _count: {
          select: {
            Mensaje: { where: { leido: false, emisorId: { not: usuarioId } } },
          },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return conversaciones.map((conv) => {
      const detalle = toDetalle(conv);
      const esCliente = conv.clienteId === usuarioId;
      const contraparte = esCliente ? detalle.freelancer : detalle.cliente;
      const ultimo = conv.Mensaje[0] ?? null;
      return {
        id: conv.id,
        fechaCreacion: conv.fechaCreacion,
        contexto: detalle.contexto,
        contraparte: {
          ...contraparte,
          rol: esCliente ? ROLES.FREELANCER : ROLES.CLIENTE,
        },
        ultimoMensaje: ultimo
          ? {
              contenido: ultimo.contenido,
              fechaEnvio: ultimo.fechaEnvio,
              emisorId: ultimo.emisorId,
              tipo: ultimo.tipo,
            }
          : null,
        noLeidos: conv._count.Mensaje,
      };
    });
  }

  async obtener(conversacionId: number): Promise<ConversacionDetalle | null> {
    const conversacion = await this.db.conversacion.findUnique({
      where: { id: conversacionId },
      include: conversacionDetalleInclude,
    });
    return conversacion ? toDetalle(conversacion) : null;
  }

  async listarMensajes(
    conversacionId: number,
    afterId: number | undefined,
    limit: number
  ): Promise<Mensaje[]> {
    const mensajes = await this.db.mensaje.findMany({
      where: {
        conversacionId,
        ...(afterId ? { id: { gt: afterId } } : {}),
      },
      include: mensajeInclude,
      orderBy: { id: 'asc' },
      take: limit,
    });
    return mensajes.map(toMensaje);
  }

  async crearMensaje(
    conversacionId: number,
    emisorId: number,
    contenido: string
  ): Promise<Mensaje> {
    const mensaje = await this.db.mensaje.create({
      data: { conversacionId, emisorId, contenido, tipo: 'texto' },
      include: mensajeInclude,
    });
    return toMensaje(mensaje);
  }

  async marcarLeidos(conversacionId: number, usuarioId: number): Promise<number> {
    const resultado = await this.db.mensaje.updateMany({
      where: {
        conversacionId,
        emisorId: { not: usuarioId },
        leido: false,
      },
      data: { leido: true },
    });
    return resultado.count;
  }
}
