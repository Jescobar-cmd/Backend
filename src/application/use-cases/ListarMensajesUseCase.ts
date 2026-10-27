import { Mensaje, usuarioParticipa } from '../../domain/entities/Conversacion';
import { ConversacionRepository } from '../../domain/ports/repositories/ConversacionRepository';
import { ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export interface MensajesPaginados {
  mensajes: Mensaje[];
  /** Último id devuelto (para el siguiente polling). */
  ultimoId: number | null;
}

/** Caso de uso: polling de mensajes nuevos (afterId). */
export class ListarMensajesUseCase {
  constructor(private conversacionRepository: ConversacionRepository) {}

  async ejecutar(
    conversacionId: number,
    usuarioId: number,
    afterId: number | undefined,
    limit: number
  ): Promise<MensajesPaginados> {
    const detalle = await this.conversacionRepository.obtener(conversacionId);
    if (!detalle) {
      throw new ErrorNoEncontrado('Conversación no encontrada');
    }
    if (!usuarioParticipa(detalle, usuarioId)) {
      throw new ErrorProhibido('No participas en esta conversación');
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
