import {
  Liquidacion,
  ResumenLiquidaciones,
} from '../../domain/entities/Liquidacion';
import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';

export interface LiquidacionesFreelancer {
  resumen: ResumenLiquidaciones;
  liquidaciones: Liquidacion[];
}

/** Caso de uso: consultar saldo, comisiones e historial de liquidaciones. */
export class ObtenerLiquidacionesFreelancerUseCase {
  constructor(private liquidacionRepository: LiquidacionRepository) {}

  async ejecutar(freelancerId: number): Promise<LiquidacionesFreelancer> {
    const [resumen, liquidaciones] = await Promise.all([
      this.liquidacionRepository.resumen(freelancerId),
      this.liquidacionRepository.listarPorFreelancer(freelancerId),
    ]);
    return { resumen, liquidaciones };
  }
}
