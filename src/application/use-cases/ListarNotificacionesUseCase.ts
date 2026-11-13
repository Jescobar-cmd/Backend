import {
  FiltrosNotificacion,
  NotificacionPaginada,
} from '../../domain/entities/Notificacion';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';

/** Caso de uso: listar las notificaciones del usuario autenticado. */
export class ListarNotificacionesUseCase {
  constructor(private notificacionRepository: NotificacionRepository) {}

  async ejecutar(
    usuarioId: number,
    filtros: FiltrosNotificacion
  ): Promise<NotificacionPaginada> {
    return this.notificacionRepository.listar(usuarioId, filtros);
  }
}
