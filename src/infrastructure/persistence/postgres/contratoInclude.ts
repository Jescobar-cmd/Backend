import { Prisma } from '@prisma/client';
import { ContratoDetalle } from '../../../domain/entities/Contrato';

export const contratoInclude = {
  Cliente: { include: { Usuario: true } },
  Freelancer: { include: { Usuario: true } },
  Proyecto: { select: { id: true, titulo: true } },
  Servicio: { select: { id: true, titulo: true } },
} satisfies Prisma.ContratoInclude;

export type ContratoConRelaciones = Prisma.ContratoGetPayload<{
  include: typeof contratoInclude;
}>;

export function toContratoDetalle(contrato: ContratoConRelaciones): ContratoDetalle {
  const contexto: ContratoDetalle['contexto'] = contrato.Proyecto
    ? { tipo: 'proyecto', id: contrato.Proyecto.id, titulo: contrato.Proyecto.titulo }
    : contrato.Servicio
      ? { tipo: 'servicio', id: contrato.Servicio.id, titulo: contrato.Servicio.titulo }
      : { tipo: 'ninguno', id: null, titulo: null };

  return {
    id: contrato.id,
    propuestaId: contrato.propuestaId,
    proyectoId: contrato.proyectoId,
    servicioId: contrato.servicioId,
    ofertaChatId: contrato.ofertaChatId,
    montoAcordado: Number(contrato.montoAcordado),
    fechaInicio: contrato.fechaInicio,
    fechaFin: contrato.fechaFin,
    estado: contrato.estado,
    contexto,
    cliente: {
      id: contrato.Cliente.id,
      nombre: contrato.Cliente.Usuario.nombre,
      fotoPerfil: contrato.Cliente.Usuario.fotoPerfil,
    },
    freelancer: {
      id: contrato.Freelancer.id,
      nombre: contrato.Freelancer.Usuario.nombre,
      fotoPerfil: contrato.Freelancer.Usuario.fotoPerfil,
    },
  };
}
