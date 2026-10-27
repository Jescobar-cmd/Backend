import { Mensaje, usuarioParticipa } from '../../domain/entities/Conversacion';
import { NuevaOfertaChat } from '../../domain/entities/OfertaChat';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { OfertaChatRepository } from '../../domain/ports/repositories/OfertaChatRepository';
import { ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: enviar una oferta de monto dentro del chat. */
export class CrearOfertaChatUseCase {
  constructor(
    private conversacionRepository: ConversacionRepository,
    private ofertaChatRepository: OfertaChatRepository
  ) {}

  async ejecutar(
    conversacionId: number,
    usuarioId: number,
    datos: NuevaOfertaChat
  ): Promise<Mensaje> {
    const detalle = await this.conversacionRepository.obtener(conversacionId);
    if (!detalle) {
      throw new ErrorNoEncontrado('Conversación no encontrada');
    }
    if (!usuarioParticipa(detalle, usuarioId)) {
      throw new ErrorProhibido('No participas en esta conversación');
    }
    return this.ofertaChatRepository.crear(conversacionId, usuarioId, datos);
  }
}
