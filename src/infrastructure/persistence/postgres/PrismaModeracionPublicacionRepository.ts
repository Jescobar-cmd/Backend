import { PrismaClient } from '@prisma/client';
import {
  DatosModeracionPublicacion,
  ModeracionPublicacion,
  TipoPublicacion,
} from '../../../domain/entities/ModeracionPublicacion';
import { ModeracionPublicacionRepository } from '../../../domain/ports/repositories/ModeracionPublicacionRepository';

const moderacionInclude = {
  Moderador: { select: { id: true, nombre: true, fotoPerfil: true } },
} as const;

type RegistroConModerador = {
  id: number;
  tipo: string;
  publicacionId: number;
  moderadorId: number;
  accion: string;
  motivo: string | null;
  estadoAnterior: string;
  estadoNuevo: string;
  fecha: Date;
  Moderador: { id: number; nombre: string; fotoPerfil: string | null } | null;
};

function toEntidad(registro: RegistroConModerador): ModeracionPublicacion {
  return {
    id: registro.id,
    tipo: registro.tipo,
    publicacionId: registro.publicacionId,
    moderadorId: registro.moderadorId,
    accion: registro.accion,
    motivo: registro.motivo,
    estadoAnterior: registro.estadoAnterior,
    estadoNuevo: registro.estadoNuevo,
    fecha: registro.fecha,
    moderador: registro.Moderador
      ? {
          id: registro.Moderador.id,
          nombre: registro.Moderador.nombre,
          fotoPerfil: registro.Moderador.fotoPerfil,
        }
      : { id: registro.moderadorId, nombre: '', fotoPerfil: null },
  };
}

/** Adaptador Prisma del puerto ModeracionPublicacionRepository. */
export class PrismaModeracionPublicacionRepository
  implements ModeracionPublicacionRepository
{
  constructor(private db: PrismaClient) {}

  async listarPorPublicacion(
    tipo: TipoPublicacion,
    publicacionId: number
  ): Promise<ModeracionPublicacion[]> {
    const registros = await this.db.moderacionPublicacion.findMany({
      where: { tipo, publicacionId },
      include: moderacionInclude,
      orderBy: { fecha: 'desc' },
    });
    return registros.map(toEntidad);
  }

  async listarUltimas(
    tipo: TipoPublicacion,
    publicacionId: number,
    limit: number
  ): Promise<ModeracionPublicacion[]> {
    const registros = await this.db.moderacionPublicacion.findMany({
      where: { tipo, publicacionId },
      include: moderacionInclude,
      orderBy: { fecha: 'desc' },
      take: limit,
    });
    return registros.map(toEntidad);
  }

  async crear(datos: DatosModeracionPublicacion): Promise<ModeracionPublicacion> {
    const registro = await this.db.moderacionPublicacion.create({
      data: {
        tipo: datos.tipo,
        publicacionId: datos.publicacionId,
        moderadorId: datos.moderadorId,
        accion: datos.accion,
        motivo: datos.motivo ?? null,
        estadoAnterior: datos.estadoAnterior,
        estadoNuevo: datos.estadoNuevo,
      },
      include: moderacionInclude,
    });
    return toEntidad(registro);
  }
}
