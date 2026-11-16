import {
  Liquidacion,
  ResumenLiquidaciones,
} from '../../domain/entities/Liquidacion';
import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';

export interface LiquidacionesFreelancer {
  resumen: ResumenLiquidaciones;
  liquidaciones: Liquidacion[];
  /** Días de validación antes de poder retirar (0 = sin espera). */
  diasValidacion: number;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Caso de uso: consultar saldo, comisiones e historial de liquidaciones. */
export class ObtenerLiquidacionesFreelancerUseCase {
  constructor(
    private liquidacionRepository: LiquidacionRepository,
    private diasValidacion = 3
  ) {}

  async ejecutar(freelancerId: number): Promise<LiquidacionesFreelancer> {
    const corte =
      this.diasValidacion > 0
        ? new Date(Date.now() - this.diasValidacion * MS_POR_DIA)
        : undefined;
    const [resumen, liquidaciones] = await Promise.all([
      this.liquidacionRepository.resumen(freelancerId, corte),
      this.liquidacionRepository.listarPorFreelancer(freelancerId),
    ]);
    return { resumen, liquidaciones, diasValidacion: this.diasValidacion };
  }
}
