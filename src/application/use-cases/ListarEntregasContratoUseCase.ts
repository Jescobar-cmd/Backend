import { EntregaContrato } from '../../domain/entities/EntregaContrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { EntregaContratoRepository } from '../../domain/ports/repositories/EntregaContratoRepository';
import {
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: listar las entregas de un contrato propio. */
export class ListarEntregasContratoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private entregaRepository: EntregaContratoRepository
  ) {}

  async ejecutar(contratoId: number, usuarioId: number): Promise<EntregaContrato[]> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== usuarioId && contrato.freelancer.id !== usuarioId) {
      throw new ErrorProhibido('No participas en este contrato');
    }
    return this.entregaRepository.listarPorContrato(contratoId);
  }
}
