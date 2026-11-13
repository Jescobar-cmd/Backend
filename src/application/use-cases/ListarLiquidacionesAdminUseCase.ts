import { EstadoLiquidacion, Liquidacion } from '../../domain/entities/Liquidacion';
import { FiltrosLiquidacion, LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';

export class ListarLiquidacionesAdminUseCase {
  constructor(private liquidacionRepository: LiquidacionRepository) {}

  async ejecutar(filtros: Omit<FiltrosLiquidacion, 'page' | 'limit'> & { page: number; limit: number }): Promise<Liquidacion[]> {
    return this.liquidacionRepository.listar(filtros);
  }

  async ejecutarSolicitados(): Promise<Liquidacion[]> {
    return this.liquidacionRepository.listar({
      estado: 'solicitada',
      page: 1,
      limit: 50,
    });
  }
}
