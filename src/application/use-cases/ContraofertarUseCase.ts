import { Mensaje } from '../../domain/entities/Conversacion';
import { NuevaOfertaChat } from '../../domain/entities/OfertaChat';
import { OfertaChatRepository } from '../../domain/ports/repositories/OfertaChatRepository';
import {
  ErrorConflicto,
  ErrorProhibido,
  ErrorNoEncontrado,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el otro participante responde con una contraoferta. */
export class ContraofertarUseCase {
  constructor(private ofertaChatRepository: OfertaChatRepository) {}

  async ejecutar(
    ofertaPadreId: number,
    usuarioId: number,
    datos: NuevaOfertaChat
  ): Promise<Mensaje> {
    const detalle = await this.ofertaChatRepository.obtenerDetalle(ofertaPadreId);
    if (!detalle) {
      throw new ErrorNoEncontrado('Oferta no encontrada');
    }
    if (detalle.clienteId !== usuarioId && detalle.freelancerId !== usuarioId) {
      throw new ErrorProhibido('No participas en esta conversación');
    }
    if (detalle.emisorId === usuarioId) {
      throw new ErrorProhibido('No puedes contraofertar tu propia oferta');
    }
    if (detalle.estado !== 'pendiente') {
      throw new ErrorConflicto('La oferta ya no está pendiente');
    }
    if (detalle.fechaExpiracion && new Date(detalle.fechaExpiracion).getTime() < Date.now()) {
      await this.ofertaChatRepository.marcarExpirada(ofertaPadreId);
      throw new ErrorConflicto('La oferta expiró');
    }
    return this.ofertaChatRepository.contraofertar(ofertaPadreId, usuarioId, datos);
  }
}
