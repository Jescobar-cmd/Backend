import { Prisma, PrismaClient } from '@prisma/client';
import { Calificacion, NuevaCalificacion } from '../../../domain/entities/Calificacion';
import { CalificacionRepository } from '../../../domain/ports/repositories/CalificacionRepository';

const calificacionInclude = {
  Usuario_Calificacion_calificadorIdToUsuario: {
    select: { id: true, nombre: true, fotoPerfil: true },
  },
  Usuario_Calificacion_calificadoIdToUsuario: {
    select: { id: true, nombre: true, fotoPerfil: true },
  },
} satisfies Prisma.CalificacionInclude;

type CalificacionConUsuarios = Prisma.CalificacionGetPayload<{
  include: typeof calificacionInclude;
}>;

function aCalificacion(calificacion: CalificacionConUsuarios): Calificacion {
  return {
    id: calificacion.id,
    contratoId: calificacion.contratoId,
    puntuacion: calificacion.puntuacion,
    comentario: calificacion.comentario,
    fecha: calificacion.fecha,
    calificador: {
      id: calificacion.Usuario_Calificacion_calificadorIdToUsuario.id,
      nombre: calificacion.Usuario_Calificacion_calificadorIdToUsuario.nombre,
      fotoPerfil: calificacion.Usuario_Calificacion_calificadorIdToUsuario.fotoPerfil,
    },
    calificado: {
      id: calificacion.Usuario_Calificacion_calificadoIdToUsuario.id,
      nombre: calificacion.Usuario_Calificacion_calificadoIdToUsuario.nombre,
      fotoPerfil: calificacion.Usuario_Calificacion_calificadoIdToUsuario.fotoPerfil,
    },
  };
}

/** Adaptador Prisma de las calificaciones y el promedio del freelancer. */
export class PrismaCalificacionRepository implements CalificacionRepository {
  constructor(private db: PrismaClient) {}

  async crear(datos: NuevaCalificacion): Promise<Calificacion> {
    const calificacion = await this.db.$transaction(async (tx) => {
      const creada = await tx.calificacion.create({
        data: {
          contratoId: datos.contratoId,
          calificadorId: datos.calificadorId,
          calificadoId: datos.calificadoId,
          puntuacion: datos.puntuacion,
          comentario: datos.comentario ?? null,
        },
        include: calificacionInclude,
      });

      // Solo el freelancer guarda promedio en su perfil.
      const freelancer = await tx.freelancer.findUnique({
        where: { id: datos.calificadoId },
        select: { id: true },
      });
      if (freelancer) {
        const promedio = await tx.calificacion.aggregate({
          where: { calificadoId: datos.calificadoId },
          _avg: { puntuacion: true },
        });
        await tx.freelancer.update({
          where: { id: datos.calificadoId },
          data: { calificacionPromedio: promedio._avg.puntuacion ?? 0 },
        });
      }

      return creada;
    });

    return aCalificacion(calificacion);
  }

  async listarPorContrato(contratoId: number): Promise<Calificacion[]> {
    const calificaciones = await this.db.calificacion.findMany({
      where: { contratoId },
      include: calificacionInclude,
      orderBy: { fecha: 'asc' },
    });
    return calificaciones.map(aCalificacion);
  }

  async buscarPorContratoYCalificador(
    contratoId: number,
    calificadorId: number
  ): Promise<Calificacion | null> {
    const calificacion = await this.db.calificacion.findFirst({
      where: { contratoId, calificadorId },
      include: calificacionInclude,
    });
    return calificacion ? aCalificacion(calificacion) : null;
  }
}
