import { Oferta } from '../../domain/entities/Oferta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: ver el detalle de una oferta propia. */
export class ObtenerMiOfertaUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async execute(clienteId: number, ofertaId: number): Promise<Oferta> {
    const oferta = await this.ofertaRepository.obtenerPorId(clienteId, ofertaId);
    if (!oferta) {
      throw new NotFoundError('Oferta no encontrada');
    }
    return oferta;
  }
}
