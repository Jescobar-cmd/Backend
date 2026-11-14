import { ContratoDetalle } from '../../domain/entities/Contrato';
import { Disputa } from '../../domain/entities/Disputa';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export interface DisputaDetalle extends Disputa {
  contrato: ContratoDetalle | null;
}

export class ObtenerDisputaAdminUseCase {
  constructor(
    private disputaRepository: DisputaRepository,
    private contratoRepository: ContratoRepository
  ) {}

  async ejecutar(id: number): Promise<DisputaDetalle> {
    const disputa = await this.disputaRepository.obtenerPorId(id);
    if (!disputa) {
      throw new ErrorNoEncontrado('Disputa no encontrada');
    }

    const contrato = await this.contratoRepository.obtener(disputa.contratoId);
    return { ...disputa, contrato };
  }
}
