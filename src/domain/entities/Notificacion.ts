export interface Notificacion {
  id: number;
  usuarioId: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  fechaCreacion: Date;
}

export interface NuevaNotificacion {
  usuarioId: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace?: string | null;
}

export interface FiltrosNotificacion {
  page: number;
  limit: number;
  soloNoLeidas?: boolean;
}

export interface NotificacionPaginada {
  page: number;
  limit: number;
  total: number;
  noLeidas: number;
  items: Notificacion[];
}
