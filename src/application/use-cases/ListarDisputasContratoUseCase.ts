import { Disputa } from '../../domain/entities/Disputa';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import {
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: listar las disputas de un contrato propio. */
export class ListarDisputasContratoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private disputaRepository: DisputaRepository
  ) {}

  async ejecutar(contratoId: number, usuarioId: number): Promise<Disputa[]> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== usuarioId && contrato.freelancer.id !== usuarioId) {
      throw new ErrorProhibido('No participas en este contrato');
    }
    return this.disputaRepository.listarPorContrato(contratoId);
  }
}
