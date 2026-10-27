import { OfertaPublica } from '../../domain/entities/Oferta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver el detalle público de una oferta abierta. */
export class ObtenerOfertaPublicaUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async ejecutar(ofertaId: number): Promise<OfertaPublica> {
    const oferta = await this.ofertaRepository.obtenerPublica(ofertaId);
    if (!oferta) {
      throw new ErrorNoEncontrado('Oferta no encontrada o ya no está abierta');
    }
    return oferta;
  }
}
