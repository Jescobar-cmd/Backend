import { ROLES } from '../../shared/constants/roles';

export interface ContratoDetalle {
  id: number;
  propuestaId: number | null;
  proyectoId: number | null;
  servicioId: number | null;
  ofertaChatId: number | null;
  montoAcordado: number;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: string;
  contexto: {
    tipo: 'proyecto' | 'servicio' | 'ninguno';
    id: number | null;
    titulo: string | null;
  };
  cliente: { id: number; nombre: string; fotoPerfil: string | null };
  freelancer: { id: number; nombre: string; fotoPerfil: string | null };
}

/** Contrato visto por un participante concreto. */
export interface ContratoVista extends ContratoDetalle {
  contraparte: { id: number; nombre: string; fotoPerfil: string | null; rol: number };
}

export function aContratoVista(detalle: ContratoDetalle, usuarioId: number): ContratoVista {
  const esCliente = detalle.cliente.id === usuarioId;
  const contraparte = esCliente ? detalle.freelancer : detalle.cliente;
  return {
    ...detalle,
    contraparte: {
      ...contraparte,
      rol: esCliente ? ROLES.FREELANCER : ROLES.CLIENTE,
    },
  };
}
