import { NuevaPropuesta, PropuestaResumen } from '../../domain/entities/Propuesta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { PropuestaRepository } from '../../domain/ports/repositories/PropuestaRepository';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: un freelancer envía una propuesta a una oferta abierta. */
export class CrearPropuestaUseCase {
  constructor(
    private propuestaRepository: PropuestaRepository,
    private ofertaRepository: OfertaRepository
  ) {}

  async execute(
    freelancerId: number,
    ofertaId: number,
    datos: NuevaPropuesta
  ): Promise<PropuestaResumen> {
    const oferta = await this.ofertaRepository.obtenerBasica(ofertaId);
    if (!oferta) {
      throw new NotFoundError('Oferta no encontrada');
    }
    if (oferta.estado !== 'abierto') {
      throw new ConflictError('La oferta no está abierta para recibir propuestas');
    }
    return this.propuestaRepository.crear(freelancerId, ofertaId, datos);
  }
}
