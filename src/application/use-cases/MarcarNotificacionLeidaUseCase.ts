import { Notificacion } from '../../domain/entities/Notificacion';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: marcar una notificación propia como leída. */
export class MarcarNotificacionLeidaUseCase {
  constructor(private notificacionRepository: NotificacionRepository) {}

  async ejecutar(notificacionId: number, usuarioId: number): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.marcarLeida(
      notificacionId,
      usuarioId
    );
    if (!notificacion) {
      throw new ErrorNoEncontrado('Notificación no encontrada');
    }
    return notificacion;
  }
}
