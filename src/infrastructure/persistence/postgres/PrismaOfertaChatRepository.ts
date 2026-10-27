import { Prisma, PrismaClient } from '@prisma/client';
import { ContratoDetalle } from '../../../domain/entities/Contrato';
import { Mensaje } from '../../../domain/entities/Conversacion';
import { NuevaOfertaChat, OfertaChatDetalle } from '../../../domain/entities/OfertaChat';
import { OfertaChatRepository } from '../../../domain/ports/repositories/OfertaChatRepository';
import { ErrorNoEncontrado } from '../../../shared/errors/ErrorAplicacion';
import { contratoInclude, toContratoDetalle } from './contratoInclude';

const mensajeInclude = { OfertaChat: true } satisfies Prisma.MensajeInclude;
type MensajeConOferta = Prisma.MensajeGetPayload<{ include: typeof mensajeInclude }>;

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

/** Adaptador Prisma del puerto OfertaChatRepository. */
export class PrismaOfertaChatRepository implements OfertaChatRepository {
  constructor(private db: PrismaClient) {}

  async crear(
    conversacionId: number,
    emisorId: number,
    datos: NuevaOfertaChat
  ): Promise<Mensaje> {
    const mensaje = await this.db.$transaction(async (tx) => {
      const creado = await tx.mensaje.create({
        data: {
          conversacionId,
          emisorId,
          contenido: `Oferta por ${datos.monto}`,
          tipo: 'oferta',
        },
      });
      await tx.ofertaChat.create({
        data: {
          conversacionId,
          mensajeId: creado.id,
          monto: datos.monto,
          descripcion: datos.descripcion ?? null,
          fechaExpiracion: datos.fechaExpiracion ?? null,
        },
      });
      return tx.mensaje.findUniqueOrThrow({
        where: { id: creado.id },
        include: mensajeInclude,
      });
    });
    return toMensaje(mensaje);
  }

  async obtenerDetalle(ofertaId: number): Promise<OfertaChatDetalle | null> {
    const oferta = await this.db.ofertaChat.findUnique({
      where: { id: ofertaId },
      include: {
        Mensaje: { select: { emisorId: true } },
        Conversacion: {
          select: { clienteId: true, freelancerId: true, proyectoId: true, servicioId: true },
        },
      },
    });
    if (!oferta) return null;
    return {
      id: oferta.id,
      conversacionId: oferta.conversacionId,
      emisorId: oferta.Mensaje.emisorId,
      clienteId: oferta.Conversacion.clienteId,
      freelancerId: oferta.Conversacion.freelancerId,
      proyectoId: oferta.Conversacion.proyectoId,
      servicioId: oferta.Conversacion.servicioId,
      monto: Number(oferta.monto),
      estado: oferta.estado,
      fechaExpiracion: oferta.fechaExpiracion,
      ofertaPadreId: oferta.ofertaPadreId,
    };
  }

  async aceptar(ofertaId: number): Promise<ContratoDetalle> {
    const contrato = await this.db.$transaction(async (tx) => {
      const oferta = await tx.ofertaChat.findUnique({
        where: { id: ofertaId },
        include: {
          Conversacion: {
            select: { clienteId: true, freelancerId: true, proyectoId: true, servicioId: true },
          },
        },
      });
      if (!oferta) {
        throw new ErrorNoEncontrado('Oferta no encontrada');
      }

      await tx.ofertaChat.update({
        where: { id: ofertaId },
        data: { estado: 'aceptada' },
      });

      // Otras ofertas pendientes de la conversación quedan rechazadas.
      await tx.ofertaChat.updateMany({
        where: {
          conversacionId: oferta.conversacionId,
          id: { not: ofertaId },
          estado: 'pendiente',
        },
        data: { estado: 'rechazada' },
      });

      if (oferta.Conversacion.proyectoId) {
        await tx.proyecto.update({
          where: { id: oferta.Conversacion.proyectoId },
          data: { estado: 'en_progreso' },
        });
      }

      return tx.contrato.create({
        data: {
          ofertaChatId: ofertaId,
          proyectoId: oferta.Conversacion.proyectoId,
          servicioId: oferta.Conversacion.servicioId,
          clienteId: oferta.Conversacion.clienteId,
          freelancerId: oferta.Conversacion.freelancerId,
          montoAcordado: oferta.monto,
          estado: 'activo',
        },
        include: contratoInclude,
      });
    });
    return toContratoDetalle(contrato);
  }

  async rechazar(ofertaId: number): Promise<void> {
    await this.db.ofertaChat.update({
      where: { id: ofertaId },
      data: { estado: 'rechazada' },
    });
  }

  async marcarExpirada(ofertaId: number): Promise<void> {
    await this.db.ofertaChat.update({
      where: { id: ofertaId },
      data: { estado: 'expirada' },
    });
  }

  async contraofertar(
    ofertaPadreId: number,
    emisorId: number,
    datos: NuevaOfertaChat
  ): Promise<Mensaje> {
    const mensaje = await this.db.$transaction(async (tx) => {
      const padre = await tx.ofertaChat.findUnique({
        where: { id: ofertaPadreId },
        select: { id: true, conversacionId: true },
      });
      if (!padre) {
        throw new ErrorNoEncontrado('Oferta no encontrada');
      }

      await tx.ofertaChat.update({
        where: { id: ofertaPadreId },
        data: { estado: 'contraofertada' },
      });

      const creado = await tx.mensaje.create({
        data: {
          conversacionId: padre.conversacionId,
          emisorId,
          contenido: `Contraoferta por ${datos.monto}`,
          tipo: 'oferta',
        },
      });

      await tx.ofertaChat.create({
        data: {
          conversacionId: padre.conversacionId,
          mensajeId: creado.id,
          monto: datos.monto,
          descripcion: datos.descripcion ?? null,
          fechaExpiracion: datos.fechaExpiracion ?? null,
          ofertaPadreId,
        },
      });

      return tx.mensaje.findUniqueOrThrow({
        where: { id: creado.id },
        include: mensajeInclude,
      });
    });
    return toMensaje(mensaje);
  }
}
