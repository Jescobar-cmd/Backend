import { EstadoOferta, Oferta } from '../../domain/entities/Oferta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: abrir, cerrar o cancelar una oferta propia (sin borrado físico). */
export class CambiarEstadoOfertaUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async execute(clienteId: number, ofertaId: number, estado: EstadoOferta): Promise<Oferta> {
    const oferta = await this.ofertaRepository.obtenerPorId(clienteId, ofertaId);
    if (!oferta) {
      throw new NotFoundError('Oferta no encontrada');
    }
    return this.ofertaRepository.cambiarEstado(clienteId, ofertaId, estado);
  }
}
