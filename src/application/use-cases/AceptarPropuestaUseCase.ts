import { aContratoVista, ContratoVista } from '../../domain/entities/Contrato';
import { PropuestaRepository } from '../../domain/ports/repositories/PropuestaRepository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors/AppError';

/**
 * Caso de uso: el cliente acepta una propuesta.
 * El adaptador cierra las demás propuestas, pasa la oferta a 'en_progreso'
 * y crea el contrato en una sola transacción.
 */
export class AceptarPropuestaUseCase {
  constructor(private propuestaRepository: PropuestaRepository) {}

  async execute(
    clienteId: number,
    ofertaId: number,
    propuestaId: number
  ): Promise<ContratoVista> {
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
    if (detalle.proyectoEstado !== 'abierto') {
      throw new ConflictError('La oferta no está abierta');
    }

    const contrato = await this.propuestaRepository.aceptar(propuestaId);
    return aContratoVista(contrato, clienteId);
  }
}
