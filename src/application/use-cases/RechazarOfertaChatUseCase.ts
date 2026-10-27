import { OfertaChatRepository } from '../../domain/ports/repositories/OfertaChatRepository';
import {
  ErrorConflicto,
  ErrorProhibido,
  ErrorNoEncontrado,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el otro participante rechaza la oferta del chat. */
export class RechazarOfertaChatUseCase {
  constructor(private ofertaChatRepository: OfertaChatRepository) {}

  async ejecutar(ofertaId: number, usuarioId: number): Promise<void> {
    const detalle = await this.ofertaChatRepository.obtenerDetalle(ofertaId);
    if (!detalle) {
      throw new ErrorNoEncontrado('Oferta no encontrada');
    }
    if (detalle.clienteId !== usuarioId && detalle.freelancerId !== usuarioId) {
      throw new ErrorProhibido('No participas en esta conversación');
    }
    if (detalle.emisorId === usuarioId) {
      throw new ErrorProhibido('No puedes rechazar tu propia oferta');
    }
    if (detalle.estado !== 'pendiente') {
      throw new ErrorConflicto('La oferta ya no está pendiente');
    }
    await this.ofertaChatRepository.rechazar(ofertaId);
  }
}
