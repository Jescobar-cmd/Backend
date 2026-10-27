import { ROLES } from '../../shared/constants/roles';

export interface ConversacionContexto {
  tipo: 'proyecto' | 'servicio' | 'ninguno';
  id: number | null;
  titulo: string | null;
}

export interface ConversacionParticipante {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

/** Datos neutros que devuelve el repositorio (sin depender del usuario que consulta). */
export interface ConversacionDetalle {
  id: number;
  fechaCreacion: Date;
  contexto: ConversacionContexto;
  cliente: ConversacionParticipante;
  freelancer: ConversacionParticipante;
}

/** Conversación vista por un participante concreto. */
export interface ConversacionVista {
  id: number;
  fechaCreacion: Date;
  contexto: ConversacionContexto;
  contraparte: ConversacionParticipante & { rol: number };
  participantes: {
    cliente: ConversacionParticipante;
    freelancer: ConversacionParticipante;
  };
}

export interface ConversacionResumen {
  id: number;
  fechaCreacion: Date;
  contexto: ConversacionContexto;
  contraparte: ConversacionParticipante & { rol: number };
  ultimoMensaje: {
    contenido: string;
    fechaEnvio: Date;
    emisorId: number;
    tipo: string;
  } | null;
  noLeidos: number;
}

export interface OfertaChatResumen {
  id: number;
  monto: number;
  descripcion: string | null;
  estado: string;
  fechaExpiracion: Date | null;
}

export interface Mensaje {
  id: number;
  emisorId: number;
  contenido: string;
  tipo: string;
  fechaEnvio: Date;
  leido: boolean;
  /** Si el mensaje es de tipo 'oferta', trae la oferta asociada. */
  oferta: OfertaChatResumen | null;
}

export function usuarioParticipa(detalle: ConversacionDetalle, usuarioId: number): boolean {
  return detalle.cliente.id === usuarioId || detalle.freelancer.id === usuarioId;
}

export function aConversacionVista(
  detalle: ConversacionDetalle,
  usuarioId: number
): ConversacionVista {
  const esCliente = detalle.cliente.id === usuarioId;
  const contraparte = esCliente ? detalle.freelancer : detalle.cliente;
  return {
    id: detalle.id,
    fechaCreacion: detalle.fechaCreacion,
    contexto: detalle.contexto,
    contraparte: {
      ...contraparte,
      rol: esCliente ? ROLES.FREELANCER : ROLES.CLIENTE,
    },
    participantes: {
      cliente: detalle.cliente,
      freelancer: detalle.freelancer,
    },
  };
}
