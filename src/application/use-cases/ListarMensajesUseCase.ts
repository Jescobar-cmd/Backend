import { Mensaje, usuarioParticipa } from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError';

export interface MensajesPaginados {
  mensajes: Mensaje[];
  /** Último id devuelto (para el siguiente polling). */
  ultimoId: number | null;
}

/** Caso de uso: polling de mensajes nuevos (afterId). */
export class ListarMensajesUseCase {
  constructor(private conversacionRepository: ConversacionRepository) {}

  async execute(
    conversacionId: number,
    usuarioId: number,
    afterId: number | undefined,
    limit: number
  ): Promise<MensajesPaginados> {
    const detalle = await this.conversacionRepository.obtener(conversacionId);
    if (!detalle) {
      throw new NotFoundError('Conversación no encontrada');
    }
    if (!usuarioParticipa(detalle, usuarioId)) {
      throw new ForbiddenError('No participas en esta conversación');
    }

    const mensajes = await this.conversacionRepository.listarMensajes(
      conversacionId,
      afterId,
      limit
    );
    const ultimoId = mensajes.length > 0 ? mensajes[mensajes.length - 1].id : afterId ?? null;
    return { mensajes, ultimoId };
  }
}
