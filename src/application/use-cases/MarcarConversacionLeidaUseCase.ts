import { usuarioParticipa } from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: marcar como leídos los mensajes del otro participante. */
export class MarcarConversacionLeidaUseCase {
  constructor(private conversacionRepository: ConversacionRepository) {}

  async execute(
    conversacionId: number,
    usuarioId: number
  ): Promise<{ actualizados: number }> {
    const detalle = await this.conversacionRepository.obtener(conversacionId);
    if (!detalle) {
      throw new NotFoundError('Conversación no encontrada');
    }
    if (!usuarioParticipa(detalle, usuarioId)) {
      throw new ForbiddenError('No participas en esta conversación');
    }
    const actualizados = await this.conversacionRepository.marcarLeidos(
      conversacionId,
      usuarioId
    );
    return { actualizados };
  }
}
