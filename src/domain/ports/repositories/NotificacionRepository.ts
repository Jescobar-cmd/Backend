import {
  FiltrosNotificacion,
  Notificacion,
  NotificacionPaginada,
  NuevaNotificacion,
} from '../../entities/Notificacion';

export interface NotificacionRepository {
  crear(datos: NuevaNotificacion): Promise<Notificacion>;

  listar(usuarioId: number, filtros: FiltrosNotificacion): Promise<NotificacionPaginada>;

  marcarLeida(notificacionId: number, usuarioId: number): Promise<Notificacion | null>;

  marcarTodasLeidas(usuarioId: number): Promise<number>;
}
