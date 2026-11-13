import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { Liquidacion, EstadoLiquidacion } from '../../domain/entities/Liquidacion';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export class AprobarRetiroUseCase {
  constructor(
    private liquidacionRepository: LiquidacionRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    liquidacionId: number,
    adminId: number,
    estado: EstadoLiquidacion,
    referencia: string | null
  ): Promise<Liquidacion> {
    const liquidacion = await this.liquidacionRepository.obtenerPorId(liquidacionId);
    if (!liquidacion) {
      throw new ErrorNoEncontrado('Liquidación no encontrada');
    }
    if (liquidacion.estado !== 'solicitada') {
      throw new ErrorNoEncontrado('La liquidación no está en solicitud de retiro');
    }

    const actualizada = await this.liquidacionRepository.aprobarRetiro(
      liquidacionId,
      adminId,
      estado,
      referencia
    );

    await this.notificacionRepository.crear({
      usuarioId: liquidacion.freelancerId,
      tipo: 'retiro_aprobado',
      titulo: 'Retiro aprobado',
      mensaje: `Tu retiro de liquidez fue aprobado por la plataforma${referencia ? `: ${referencia}` : ''}`,
      enlace: `/api/freelancer/liquidaciones`,
    });

    return actualizada;
  }
}
