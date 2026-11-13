import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';

/** Caso de uso: marcar todas las notificaciones del usuario como leídas. */
export class MarcarTodasNotificacionesLeidasUseCase {
  constructor(private notificacionRepository: NotificacionRepository) {}

  async ejecutar(usuarioId: number): Promise<{ actualizadas: number }> {
    const actualizadas = await this.notificacionRepository.marcarTodasLeidas(usuarioId);
    return { actualizadas };
  }
}
