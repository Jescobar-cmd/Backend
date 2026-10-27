import { Mensaje, usuarioParticipa } from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: enviar un mensaje de texto a una conversación propia. */
export class EnviarMensajeUseCase {
  constructor(private conversacionRepository: ConversacionRepository) {}

  async ejecutar(
    conversacionId: number,
    usuarioId: number,
    contenido: string
  ): Promise<Mensaje> {
    const detalle = await this.conversacionRepository.obtener(conversacionId);
    if (!detalle) {
      throw new ErrorNoEncontrado('Conversación no encontrada');
    }
    if (!usuarioParticipa(detalle, usuarioId)) {
      throw new ErrorProhibido('No participas en esta conversación');
    }
    return this.conversacionRepository.crearMensaje(conversacionId, usuarioId, contenido);
  }
}
