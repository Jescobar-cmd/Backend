import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';
import { ErrorConflicto } from '../../shared/errors/ErrorAplicacion';

export interface RetiroSolicitado {
  cantidad: number;
  total: number;
}

/** Caso de uso: solicitar el retiro de todas las liquidaciones disponibles. */
export class SolicitarRetiroUseCase {
  constructor(private liquidacionRepository: LiquidacionRepository) {}

  async ejecutar(freelancerId: number): Promise<RetiroSolicitado> {
    const resultado = await this.liquidacionRepository.solicitarRetiro(freelancerId);
    if (resultado.cantidad === 0) {
      throw new ErrorConflicto('No tienes saldo disponible para retirar');
    }
    return resultado;
  }
}
