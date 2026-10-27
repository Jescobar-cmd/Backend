import { NuevaPropuesta, PropuestaResumen } from '../../domain/entities/Propuesta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { PropuestaRepository } from '../../domain/ports/repositories/PropuestaRepository';
import { ErrorConflicto, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: un freelancer envía una propuesta a una oferta abierta. */
export class CrearPropuestaUseCase {
  constructor(
    private propuestaRepository: PropuestaRepository,
    private ofertaRepository: OfertaRepository
  ) {}

  async ejecutar(
    freelancerId: number,
    ofertaId: number,
    datos: NuevaPropuesta
  ): Promise<PropuestaResumen> {
    const oferta = await this.ofertaRepository.obtenerBasica(ofertaId);
    if (!oferta) {
      throw new ErrorNoEncontrado('Oferta no encontrada');
    }
    if (oferta.estado !== 'abierto') {
      throw new ErrorConflicto('La oferta no está abierta para recibir propuestas');
    }
    return this.propuestaRepository.crear(freelancerId, ofertaId, datos);
  }
}
