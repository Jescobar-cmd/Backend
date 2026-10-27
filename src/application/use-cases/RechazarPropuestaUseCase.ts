import { PropuestaRepository } from '../../domain/ports/repositories/PropuestaRepository';
import {
  ErrorConflicto,
  ErrorProhibido,
  ErrorNoEncontrado,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el cliente rechaza una propuesta. */
export class RechazarPropuestaUseCase {
  constructor(private propuestaRepository: PropuestaRepository) {}

  async ejecutar(clienteId: number, ofertaId: number, propuestaId: number): Promise<void> {
    const detalle = await this.propuestaRepository.obtenerDetalle(propuestaId);
    if (!detalle || detalle.proyectoId !== ofertaId) {
      throw new ErrorNoEncontrado('Propuesta no encontrada');
    }
    if (detalle.clienteId !== clienteId) {
      throw new ErrorProhibido('La oferta no te pertenece');
    }
    if (detalle.estado !== 'pendiente') {
      throw new ErrorConflicto('La propuesta ya fue procesada');
    }
    await this.propuestaRepository.rechazar(propuestaId);
  }
}
