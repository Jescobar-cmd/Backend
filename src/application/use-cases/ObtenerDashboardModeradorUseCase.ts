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
    const [reportesPendientes, disputasAbiertas, retirosPendientes] =
      await Promise.all([
        this.reporteRepository.contar({ estado: 'pendiente' }),
        this.disputaRepository.contar({ estado: 'abierta' }),
        this.liquidacionRepository.contar({ estado: 'solicitada' }),
      ]);

    return { reportesPendientes, disputasAbiertas, retirosPendientes };
  }
}
