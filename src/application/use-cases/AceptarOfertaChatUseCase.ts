import { aContratoVista, ContratoVista } from '../../domain/entities/Contrato';
import { OfertaChatRepository } from '../../domain/ports/repositories/OfertaChatRepository';
import {
  ErrorConflicto,
  ErrorProhibido,
  ErrorNoEncontrado,
} from '../../shared/errors/ErrorAplicacion';

/**
 * Caso de uso: el otro participante acepta la oferta del chat.
 * Crea el contrato y, si la conversación viene de una oferta, la pasa a 'en_progreso'.
 */
export class AceptarOfertaChatUseCase {
  constructor(private ofertaChatRepository: OfertaChatRepository) {}

  async ejecutar(ofertaId: number, usuarioId: number): Promise<ContratoVista> {
    const detalle = await this.ofertaChatRepository.obtenerDetalle(ofertaId);
    if (!detalle) {
      throw new ErrorNoEncontrado('Oferta no encontrada');
    }
    if (detalle.clienteId !== usuarioId && detalle.freelancerId !== usuarioId) {
      throw new ErrorProhibido('No participas en esta conversación');
    }
    if (detalle.emisorId === usuarioId) {
      throw new ErrorProhibido('No puedes aceptar tu propia oferta');
    }
    if (detalle.estado !== 'pendiente') {
      throw new ErrorConflicto('La oferta ya no está pendiente');
    }
    if (detalle.fechaExpiracion && new Date(detalle.fechaExpiracion).getTime() < Date.now()) {
      await this.ofertaChatRepository.marcarExpirada(ofertaId);
      throw new ErrorConflicto('La oferta expiró');
    }

    const contrato = await this.ofertaChatRepository.aceptar(ofertaId);
    return aContratoVista(contrato, usuarioId);
  }
}
