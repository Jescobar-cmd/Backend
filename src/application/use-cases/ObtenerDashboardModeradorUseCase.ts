import { ModeradorDashboard } from '../../domain/entities/Moderador';
import { ReporteRepository } from '../../domain/ports/repositories/ReporteRepository';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';

export class ObtenerDashboardModeradorUseCase {
  constructor(
    private reporteRepository: ReporteRepository,
    private disputaRepository: DisputaRepository,
    private liquidacionRepository: LiquidacionRepository
  ) {}

  async ejecutar(): Promise<ModeradorDashboard> {
    const [reportesPendientes, disputasAbiertas, retirosPendientes] = await Promise.all([
      this.reporteRepository.listar({
        estado: 'pendiente',
        page: 1,
        limit: 50,
      }),
      this.disputaRepository.listar({
        estado: 'abierta',
        page: 1,
        limit: 50,
      }),
      this.liquidacionRepository.listar({
        estado: 'solicitada',
        page: 1,
        limit: 50,
      }),
    ]);

    return {
      reportesPendientes: reportesPendientes.length,
      disputasAbiertas: disputasAbiertas.length,
      retirosPendientes: retirosPendientes.length,
    };
  }
}
