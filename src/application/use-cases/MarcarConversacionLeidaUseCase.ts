import { usuarioParticipa } from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: marcar como leídos los mensajes del otro participante. */
export class MarcarConversacionLeidaUseCase {
  constructor(private conversacionRepository: ConversacionRepository) {}

  async ejecutar(
    conversacionId: number,
    usuarioId: number
  ): Promise<{ actualizados: number }> {
    const detalle = await this.conversacionRepository.obtener(conversacionId);
    if (!detalle) {
      throw new ErrorNoEncontrado('Conversación no encontrada');
    }
    if (!usuarioParticipa(detalle, usuarioId)) {
      throw new ErrorProhibido('No participas en esta conversación');
    }
    const actualizados = await this.conversacionRepository.marcarLeidos(
      conversacionId,
      usuarioId
    );
    return { actualizados };
  }
}
