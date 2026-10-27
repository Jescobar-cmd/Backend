import { ConversacionResumen } from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';

/** Caso de uso: listar mis conversaciones (como cliente o como freelancer). */
export class ListarConversacionesUseCase {
  constructor(private conversacionRepository: ConversacionRepository) {}

  async execute(usuarioId: number): Promise<ConversacionResumen[]> {
    return this.conversacionRepository.listar(usuarioId);
  }
}
