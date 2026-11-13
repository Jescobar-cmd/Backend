import { EstadoDisputa, Disputa } from '../../domain/entities/Disputa';
import { FiltrosDisputa, DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';

export class ListarDisputasAdminUseCase {
  constructor(private disputaRepository: DisputaRepository) {}

  async ejecutar(filtros: Omit<FiltrosDisputa, 'page' | 'limit'> & { page: number; limit: number }): Promise<Disputa[]> {
    return this.disputaRepository.listar(filtros);
  }

  async ejecutarPendientes(): Promise<Disputa[]> {
    return this.disputaRepository.listar({
      estado: 'abierta',
      page: 1,
      limit: 50,
    });
  }
}
