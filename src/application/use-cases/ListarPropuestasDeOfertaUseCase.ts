import { PropuestaResumen } from '../../domain/entities/Propuesta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: ver las propuestas recibidas en una oferta propia. */
export class ListarPropuestasDeOfertaUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async execute(clienteId: number, ofertaId: number): Promise<PropuestaResumen[]> {
    const propuestas = await this.ofertaRepository.listarPropuestas(clienteId, ofertaId);
    if (propuestas === null) {
      throw new NotFoundError('Oferta no encontrada');
    }
    return propuestas;
  }
}
