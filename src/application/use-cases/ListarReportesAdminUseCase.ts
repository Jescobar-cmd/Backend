import { Reporte } from '../../domain/entities/Reporte';
import { FiltrosReporte, ReporteRepository } from '../../domain/ports/repositories/ReporteRepository';

export interface ReportesPaginados {
  total: number;
  reportes: Reporte[];
}

export class ListarReportesAdminUseCase {
  constructor(private reporteRepository: ReporteRepository) {}

  async ejecutar(filtros: FiltrosReporte): Promise<ReportesPaginados> {
    const { page, limit, ...filtro } = filtros;
    const [reportes, total] = await Promise.all([
      this.reporteRepository.listar({ ...filtro, page, limit }),
      this.reporteRepository.contar(filtro),
    ]);

    return { total, reportes };
  }
}
