import {
  aConversacionVista,
  ConversacionVista,
  usuarioParticipa,
} from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver el detalle de una conversación propia. */
export class ObtenerConversacionUseCase {
  constructor(private conversacionRepository: ConversacionRepository) {}

  async ejecutar(conversacionId: number, usuarioId: number): Promise<ConversacionVista> {
    const detalle = await this.conversacionRepository.obtener(conversacionId);
    if (!detalle) {
      throw new ErrorNoEncontrado('Conversación no encontrada');
    }
    if (!usuarioParticipa(detalle, usuarioId)) {
      throw new ErrorProhibido('No participas en esta conversación');
    }
    return aConversacionVista(detalle, usuarioId);
  }
}
