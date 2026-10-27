import { Oferta } from '../../domain/entities/Oferta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver el detalle de una oferta propia. */
export class ObtenerMiOfertaUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async ejecutar(clienteId: number, ofertaId: number): Promise<Oferta> {
    const oferta = await this.ofertaRepository.obtenerPorId(clienteId, ofertaId);
    if (!oferta) {
      throw new ErrorNoEncontrado('Oferta no encontrada');
    }
    return oferta;
  }
}
