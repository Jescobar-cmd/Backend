import { OfertaChatRepository } from '../../domain/ports/repositories/OfertaChatRepository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors/AppError';

/** Caso de uso: el otro participante rechaza la oferta del chat. */
export class RechazarOfertaChatUseCase {
  constructor(private ofertaChatRepository: OfertaChatRepository) {}

  async execute(ofertaId: number, usuarioId: number): Promise<void> {
    const detalle = await this.ofertaChatRepository.obtenerDetalle(ofertaId);
    if (!detalle) {
      throw new NotFoundError('Oferta no encontrada');
    }
    if (detalle.clienteId !== usuarioId && detalle.freelancerId !== usuarioId) {
      throw new ForbiddenError('No participas en esta conversación');
    }
    if (detalle.emisorId === usuarioId) {
      throw new ForbiddenError('No puedes rechazar tu propia oferta');
    }
    if (detalle.estado !== 'pendiente') {
      throw new ConflictError('La oferta ya no está pendiente');
    }
    await this.ofertaChatRepository.rechazar(ofertaId);
  }
}
