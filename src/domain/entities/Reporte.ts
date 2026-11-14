export type EstadoReporte = 'pendiente' | 'resuelto' | 'rechazado';

export interface Reporte {
  id: number;
  usuarioReportaId: number;
  usuarioReportadoId: number | null;
  proyectoId: number | null;
  adminId: number | null;
  motivo: string;
  descripcion: string | null;
  estado: EstadoReporte;
  resolucion: string | null;
  fechaResolucion: Date | null;
  fecha: Date;
}

/** Reporte con el contexto que necesita el panel de moderación. */
export interface ReporteDetalle extends Reporte {
  usuarioReporta: { id: number; nombre: string; fotoPerfil: string | null };
  usuarioReportado: { id: number; nombre: string; fotoPerfil: string | null } | null;
  proyecto: { id: number; titulo: string } | null;
}

export interface NuevaReporte {
  usuarioReportaId: number;
  usuarioReportadoId: number | null;
  proyectoId: number | null;
  adminId: number | null;
  motivo: string;
  descripcion: string | null;
  estado: EstadoReporte;
}

export interface DatosResolverReporte {
  adminId: number;
  resolucion: string;
}

export interface ResultadoResolverReporte {
  reporte: Reporte;
  notificacionEnviada: boolean;
}
