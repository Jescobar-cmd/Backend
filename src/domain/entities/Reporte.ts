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
