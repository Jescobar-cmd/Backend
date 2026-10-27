import { Prisma, PrismaClient } from '@prisma/client';
import { ContratoDetalle } from '../../../domain/entities/Contrato';
import {
  NuevaPropuesta,
  PropuestaDetalle,
  PropuestaResumen,
} from '../../../domain/entities/Propuesta';
import { PropuestaRepository } from '../../../domain/ports/repositories/PropuestaRepository';
import { ErrorNoEncontrado } from '../../../shared/errors/ErrorAplicacion';
import { contratoInclude, toContratoDetalle } from './contratoInclude';

const propuestaInclude = {
  Freelancer: { include: { Usuario: true } },
  Proyecto: { select: { id: true, titulo: true, estado: true } },
} satisfies Prisma.PropuestaInclude;

type PropuestaConRelaciones = Prisma.PropuestaGetPayload<{
  include: typeof propuestaInclude;
}>;

function toPropuestaResumen(propuesta: PropuestaConRelaciones): PropuestaResumen {
  return {
    id: propuesta.id,
    mensaje: propuesta.mensaje,
    montoPropuesto: Number(propuesta.montoPropuesto),
    estado: propuesta.estado,
    fechaEnvio: propuesta.fechaEnvio,
    freelancer: {
      id: propuesta.Freelancer.id,
      nombre: propuesta.Freelancer.Usuario.nombre,
      fotoPerfil: propuesta.Freelancer.Usuario.fotoPerfil,
      calificacionPromedio: Number(propuesta.Freelancer.calificacionPromedio),
    },
    proyecto: {
      id: propuesta.Proyecto.id,
      titulo: propuesta.Proyecto.titulo,
      estado: propuesta.Proyecto.estado,
    },
  };
}

/** Adaptador Prisma del puerto PropuestaRepository. */
export class PrismaPropuestaRepository implements PropuestaRepository {
  constructor(private db: PrismaClient) {}

  async crear(
    freelancerId: number,
    proyectoId: number,
    datos: NuevaPropuesta
  ): Promise<PropuestaResumen> {
    const propuesta = await this.db.$transaction(async (tx) => {
      // Propuesta.freelancerId apunta a Freelancer (no a Usuario).
      await tx.freelancer.upsert({
        where: { id: freelancerId },
        create: { id: freelancerId },
        update: {},
      });
      return tx.propuesta.create({
        data: {
          proyectoId,
          freelancerId,
          mensaje: datos.mensaje ?? null,
          montoPropuesto: datos.montoPropuesto,
        },
        include: propuestaInclude,
      });
    });
    return toPropuestaResumen(propuesta);
  }

  async listarPorFreelancer(freelancerId: number): Promise<PropuestaResumen[]> {
    const propuestas = await this.db.propuesta.findMany({
      where: { freelancerId },
      include: propuestaInclude,
      orderBy: { fechaEnvio: 'desc' },
    });
    return propuestas.map(toPropuestaResumen);
  }

  async obtenerDetalle(propuestaId: number): Promise<PropuestaDetalle | null> {
    const propuesta = await this.db.propuesta.findUnique({
      where: { id: propuestaId },
      include: { Proyecto: { select: { clienteId: true, estado: true } } },
    });
    if (!propuesta) return null;
    return {
      id: propuesta.id,
      proyectoId: propuesta.proyectoId,
      freelancerId: propuesta.freelancerId,
      clienteId: propuesta.Proyecto.clienteId,
      estado: propuesta.estado,
      montoPropuesto: Number(propuesta.montoPropuesto),
      proyectoEstado: propuesta.Proyecto.estado,
    };
  }

  async aceptar(propuestaId: number): Promise<ContratoDetalle> {
    const contrato = await this.db.$transaction(async (tx) => {
      const propuesta = await tx.propuesta.findUnique({
        where: { id: propuestaId },
        include: { Proyecto: { select: { clienteId: true } } },
      });
      if (!propuesta) {
        throw new ErrorNoEncontrado('Propuesta no encontrada');
      }

      await tx.propuesta.update({
        where: { id: propuestaId },
        data: { estado: 'aceptada' },
      });

      // Las demás propuestas pendientes de la misma oferta quedan rechazadas.
      await tx.propuesta.updateMany({
        where: {
          proyectoId: propuesta.proyectoId,
          id: { not: propuestaId },
          estado: 'pendiente',
        },
        data: { estado: 'rechazada' },
      });

      await tx.proyecto.update({
        where: { id: propuesta.proyectoId },
        data: { estado: 'en_progreso' },
      });

      return tx.contrato.create({
        data: {
          propuestaId,
          proyectoId: propuesta.proyectoId,
          clienteId: propuesta.Proyecto.clienteId,
          freelancerId: propuesta.freelancerId,
          montoAcordado: propuesta.montoPropuesto,
          estado: 'activo',
        },
        include: contratoInclude,
      });
    });
    return toContratoDetalle(contrato);
  }

  async rechazar(propuestaId: number): Promise<void> {
    await this.db.propuesta.update({
      where: { id: propuestaId },
      data: { estado: 'rechazada' },
    });
  }
}
