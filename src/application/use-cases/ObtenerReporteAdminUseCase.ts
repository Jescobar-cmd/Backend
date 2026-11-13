import { Reporte } from '../../domain/entities/Reporte';
import { ReporteRepository } from '../../domain/ports/repositories/ReporteRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export class ObtenerReporteAdminUseCase {
  constructor(private reporteRepository: ReporteRepository) {}

  async ejecutar(id: number): Promise<Reporte> {
    const reporte = await this.reporteRepository.obtenerPorId(id);
    if (!reporte) {
      throw new ErrorNoEncontrado('Reporte no encontrado');
    }
    return reporte;
  }
}
