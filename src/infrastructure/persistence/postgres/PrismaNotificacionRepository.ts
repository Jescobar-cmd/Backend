import { PrismaClient } from '@prisma/client';
import {
  FiltrosNotificacion,
  Notificacion,
  NotificacionPaginada,
  NuevaNotificacion,
} from '../../../domain/entities/Notificacion';
import { NotificacionRepository } from '../../../domain/ports/repositories/NotificacionRepository';

function toNotificacion(notificacion: {
  id: number;
  usuarioId: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  fechaCreacion: Date;
}): Notificacion {
  return {
    id: notificacion.id,
    usuarioId: notificacion.usuarioId,
    tipo: notificacion.tipo,
    titulo: notificacion.titulo,
    mensaje: notificacion.mensaje,
    enlace: notificacion.enlace,
    leida: notificacion.leida,
    fechaCreacion: notificacion.fechaCreacion,
  };
}

/** Adaptador Prisma del puerto NotificacionRepository. */
export class PrismaNotificacionRepository implements NotificacionRepository {
  constructor(private db: PrismaClient) {}

  async crear(datos: NuevaNotificacion): Promise<Notificacion> {
    const creada = await this.db.notificacion.create({
      data: {
        usuarioId: datos.usuarioId,
        tipo: datos.tipo,
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        enlace: datos.enlace ?? null,
      },
    });
    return toNotificacion(creada);
  }

  async listar(
    usuarioId: number,
    filtros: FiltrosNotificacion
  ): Promise<NotificacionPaginada> {
    const where = {
      usuarioId,
      ...(filtros.soloNoLeidas ? { leida: false } : {}),
    };

    const [total, noLeidas, items] = await Promise.all([
      this.db.notificacion.count({ where }),
      this.db.notificacion.count({ where: { usuarioId, leida: false } }),
      this.db.notificacion.findMany({
        where,
        orderBy: { fechaCreacion: 'desc' },
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
    ]);

    return {
      page: filtros.page,
      limit: filtros.limit,
      total,
      noLeidas,
      items: items.map(toNotificacion),
    };
  }

  async marcarLeida(
    notificacionId: number,
    usuarioId: number
  ): Promise<Notificacion | null> {
    const existente = await this.db.notificacion.findFirst({
      where: { id: notificacionId, usuarioId },
    });
    if (!existente) {
      return null;
    }

    const actualizada = await this.db.notificacion.update({
      where: { id: notificacionId },
      data: { leida: true },
    });
    return toNotificacion(actualizada);
  }

  async marcarTodasLeidas(usuarioId: number): Promise<number> {
    const resultado = await this.db.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
    return resultado.count;
  }
}
