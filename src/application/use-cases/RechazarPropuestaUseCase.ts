import { PropuestaRepository } from '../../domain/ports/repositories/PropuestaRepository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors/AppError';

/** Caso de uso: el cliente rechaza una propuesta. */
export class RechazarPropuestaUseCase {
  constructor(private propuestaRepository: PropuestaRepository) {}

  async execute(clienteId: number, ofertaId: number, propuestaId: number): Promise<void> {
    const detalle = await this.propuestaRepository.obtenerDetalle(propuestaId);
    if (!detalle || detalle.proyectoId !== ofertaId) {
      throw new NotFoundError('Propuesta no encontrada');
    }
    if (detalle.clienteId !== clienteId) {
      throw new ForbiddenError('La oferta no te pertenece');
    }
    if (detalle.estado !== 'pendiente') {
      throw new ConflictError('La propuesta ya fue procesada');
    }
    await this.propuestaRepository.rechazar(propuestaId);
  }
}
