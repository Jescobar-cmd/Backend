import { PagoEscrow } from '../../domain/entities/Pago';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import {
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: consultar el estado del pago escrow de un contrato. */
export class ConsultarPagoContratoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private pagoRepository: PagoRepository
  ) {}

  async ejecutar(contratoId: number, usuarioId: number): Promise<PagoEscrow | null> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (
      contrato.cliente.id !== usuarioId &&
      contrato.freelancer.id !== usuarioId
    ) {
      throw new ErrorProhibido('No participas en este contrato');
    }
    return this.pagoRepository.obtenerPorContrato(contratoId);
  }
}
