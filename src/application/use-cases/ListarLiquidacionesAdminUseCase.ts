import { Liquidacion } from '../../domain/entities/Liquidacion';
import {
  FiltrosLiquidacion,
  LiquidacionRepository,
} from '../../domain/ports/repositories/LiquidacionRepository';

export interface LiquidacionesPaginadas {
  total: number;
  liquidaciones: Liquidacion[];
}

export class ListarLiquidacionesAdminUseCase {
  constructor(private liquidacionRepository: LiquidacionRepository) {}

  async ejecutar(filtros: FiltrosLiquidacion): Promise<LiquidacionesPaginadas> {
    const { page, limit, ...filtro } = filtros;
    const [liquidaciones, total] = await Promise.all([
      this.liquidacionRepository.listar({ ...filtro, page, limit }),
      this.liquidacionRepository.contar(filtro),
    ]);

    return { total, liquidaciones };
  }
}
