import { ContratoDetalle } from './Contrato';
import { Proyecto } from './Proyecto';
import { Servicio } from './Servicio';

export interface ModeracionPublicacion {
  id: number;
  tipo: string;
  publicacionId: number;
  moderadorId: number;
  accion: string;
  motivo?: string | null;
  estadoAnterior: string;
  estadoNuevo: string;
  fecha: Date;
  moderador: {
    id: number;
    nombre: string;
    fotoPerfil?: string | null;
  };
}

export interface DatosModeracionPublicacion {
  tipo: string;
  publicacionId: number;
  moderadorId: number;
  accion: string;
  motivo?: string | null;
  estadoAnterior: string;
  estadoNuevo: string;
}

/* ---------- Vista unificada de servicios y proyectos para el panel ---------- */

export type TipoPublicacion = 'servicio' | 'proyecto';

export interface AutorPublicacionModerada {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  estado: string;
}

export interface ContratoPublicacionResumen {
  id: number;
  estado: string;
  montoAcordado: number;
}

export interface RegistroModeracion {
  id?: number;
  retirada: boolean;
  motivo: string | null;
  fecha: string | null;
  moderador: { id: number; nombre: string } | null;
}

export interface PublicacionModerada {
  id: number;
  tipo: TipoPublicacion;
  titulo: string;
  descripcion: string;
  /** Servicios: precio del servicio. Proyectos: presupuesto (puede ser null). */
  precio: number | null;
  estado: string;
  autor: AutorPublicacionModerada;
  categoria: string | null;
  fechaPublicacion: string;
  moderacion: RegistroModeracion;
  contratosActivos: ContratoPublicacionResumen[];
  historial?: RegistroModeracion[];
}

export function aRegistroModeracion(registro: ModeracionPublicacion | null): RegistroModeracion {
  if (!registro) {
    return { retirada: false, motivo: null, fecha: null, moderador: null };
  }
  return {
    id: registro.id,
    retirada: registro.accion === 'retirar',
    motivo: registro.motivo ?? null,
    fecha: registro.fecha.toISOString(),
    moderador: registro.moderador
      ? { id: registro.moderador.id, nombre: registro.moderador.nombre }
      : null,
  };
}

function aContratosResumen(contratos: ContratoDetalle[]): ContratoPublicacionResumen[] {
  return contratos.map((contrato) => ({
    id: contrato.id,
    estado: contrato.estado,
    montoAcordado: contrato.montoAcordado,
  }));
}

export function publicacionModeradaDesdeServicio(
  servicio: Servicio,
  contratos: ContratoDetalle[],
  ultimaModeracion: ModeracionPublicacion | null
): PublicacionModerada {
  return {
    id: servicio.id,
    tipo: 'servicio',
    titulo: servicio.titulo,
    descripcion: servicio.descripcion,
    precio: servicio.precio,
    estado: servicio.estado,
    autor: {
      id: servicio.freelancer.id,
      nombre: servicio.freelancer.nombre,
      fotoPerfil: servicio.freelancer.fotoPerfil,
      estado: servicio.freelancer.estado ?? 'activo',
    },
    categoria: servicio.categoria?.nombre ?? null,
    fechaPublicacion: servicio.fechaCreacion.toISOString(),
    moderacion: aRegistroModeracion(ultimaModeracion),
    contratosActivos: aContratosResumen(contratos),
  };
}

export function publicacionModeradaDesdeProyecto(
  proyecto: Proyecto,
  contratos: ContratoDetalle[],
  ultimaModeracion: ModeracionPublicacion | null
): PublicacionModerada {
  return {
    id: proyecto.id,
    tipo: 'proyecto',
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion ?? '',
    precio: proyecto.presupuesto,
    estado: proyecto.estado,
    autor: {
      id: proyecto.cliente?.id ?? proyecto.clienteId,
      nombre: proyecto.cliente?.nombre ?? '',
      fotoPerfil: proyecto.cliente?.fotoPerfil ?? null,
      estado: proyecto.cliente?.estado ?? 'activo',
    },
    categoria: proyecto.categoria?.nombre ?? null,
    fechaPublicacion: proyecto.fechaPublicacion.toISOString(),
    moderacion: aRegistroModeracion(ultimaModeracion),
    contratosActivos: aContratosResumen(contratos),
  };
}
