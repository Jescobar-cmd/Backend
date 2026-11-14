import { Disputa } from '../../domain/entities/Disputa';
import {
  FiltrosDisputa,
  DisputaRepository,
} from '../../domain/ports/repositories/DisputaRepository';

export interface DisputasPaginadas {
  total: number;
  disputas: Disputa[];
}

export class ListarDisputasAdminUseCase {
  constructor(private disputaRepository: DisputaRepository) {}

  async ejecutar(filtros: FiltrosDisputa): Promise<DisputasPaginadas> {
    const { page, limit, ...filtro } = filtros;
    const [disputas, total] = await Promise.all([
      this.disputaRepository.listar({ ...filtro, page, limit }),
      this.disputaRepository.contar(filtro),
    ]);

    return { total, disputas };
  }
}
