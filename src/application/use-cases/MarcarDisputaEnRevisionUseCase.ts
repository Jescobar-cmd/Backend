import { Disputa } from '../../domain/entities/Disputa';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el moderador marca una disputa como "en revisión". */
export class MarcarDisputaEnRevisionUseCase {
  constructor(private disputaRepository: DisputaRepository) {}

  async ejecutar(disputaId: number, adminId: number): Promise<Disputa> {
    const disputa = await this.disputaRepository.obtenerPorId(disputaId);
    if (!disputa) {
      throw new ErrorNoEncontrado('Disputa no encontrada');
    }
    if (disputa.estado !== 'abierta') {
      throw new ErrorConflicto('Solo una disputa abierta puede pasar a revisión');
    }
    return this.disputaRepository.marcarEnRevision(disputaId, adminId);
  }
}
