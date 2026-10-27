import { Mensaje } from '../../domain/entities/Conversacion';
import { NuevaOfertaChat } from '../../domain/entities/OfertaChat';
import { OfertaChatRepository } from '../../domain/ports/repositories/OfertaChatRepository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors/AppError';

/** Caso de uso: el otro participante responde con una contraoferta. */
export class ContraofertarUseCase {
  constructor(private ofertaChatRepository: OfertaChatRepository) {}

  async execute(
    ofertaPadreId: number,
    usuarioId: number,
    datos: NuevaOfertaChat
  ): Promise<Mensaje> {
    const detalle = await this.ofertaChatRepository.obtenerDetalle(ofertaPadreId);
    if (!detalle) {
      throw new NotFoundError('Oferta no encontrada');
    }
    if (detalle.clienteId !== usuarioId && detalle.freelancerId !== usuarioId) {
      throw new ForbiddenError('No participas en esta conversación');
    }
    if (detalle.emisorId === usuarioId) {
      throw new ForbiddenError('No puedes contraofertar tu propia oferta');
    }
    if (detalle.estado !== 'pendiente') {
      throw new ConflictError('La oferta ya no está pendiente');
    }
    if (detalle.fechaExpiracion && detalle.fechaExpiracion.getTime() < Date.now()) {
      await this.ofertaChatRepository.marcarExpirada(ofertaPadreId);
      throw new ConflictError('La oferta expiró');
    }
    return this.ofertaChatRepository.contraofertar(ofertaPadreId, usuarioId, datos);
  }
}
