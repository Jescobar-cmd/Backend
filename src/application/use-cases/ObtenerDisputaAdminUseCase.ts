import { Disputa } from '../../domain/entities/Disputa';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export class ObtenerDisputaAdminUseCase {
  constructor(private disputaRepository: DisputaRepository) {}

  async ejecutar(id: number): Promise<Disputa> {
    const disputa = await this.disputaRepository.obtenerPorId(id);
    if (!disputa) {
      throw new ErrorNoEncontrado('Disputa no encontrada');
    }
    return disputa;
  }
}
