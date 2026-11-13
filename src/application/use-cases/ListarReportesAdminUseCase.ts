import { Reporte } from '../../domain/entities/Reporte';
import { FiltrosReporte, ReporteRepository } from '../../domain/ports/repositories/ReporteRepository';

export class ListarReportesAdminUseCase {
  constructor(private reporteRepository: ReporteRepository) {}

  async ejecutar(filtros: Omit<FiltrosReporte, 'page' | 'limit'> & { page: number; limit: number }): Promise<Reporte[]> {
    return this.reporteRepository.listar(filtros);
  }

  async ejecutarPendientes(): Promise<Reporte[]> {
    return this.reporteRepository.listar({
      estado: 'pendiente',
      page: 1,
      limit: 50,
    });
  }
}
