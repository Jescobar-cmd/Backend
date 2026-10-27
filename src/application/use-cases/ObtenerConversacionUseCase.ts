import {
  aConversacionVista,
  ConversacionVista,
  usuarioParticipa,
} from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: ver el detalle de una conversación propia. */
export class ObtenerConversacionUseCase {
  constructor(private conversacionRepository: ConversacionRepository) {}

  async execute(conversacionId: number, usuarioId: number): Promise<ConversacionVista> {
    const detalle = await this.conversacionRepository.obtener(conversacionId);
    if (!detalle) {
      throw new NotFoundError('Conversación no encontrada');
    }
    if (!usuarioParticipa(detalle, usuarioId)) {
      throw new ForbiddenError('No participas en esta conversación');
    }
    return aConversacionVista(detalle, usuarioId);
  }
}
