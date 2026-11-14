import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { Liquidacion, EstadoLiquidacion } from '../../domain/entities/Liquidacion';
import { ErrorConflicto, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

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
      throw new ErrorConflicto(
        'La liquidación no está en solicitud de retiro'
      );
    }

    const actualizada = await this.liquidacionRepository.aprobarRetiro(
      liquidacionId,
      adminId,
      estado,
      referencia
    );

    const esPago = estado === 'pagada';
    const titulo = esPago ? 'Retiro pagado' : 'Retiro rechazado';
    const mensaje = esPago
      ? `Tu retiro de liquidez fue pagado por la plataforma${
          referencia ? `: ${referencia}` : ''
        }`
      : `Tu solicitud de retiro fue rechazada${
          referencia ? `: ${referencia}` : ''
        }`;

    await this.notificacionRepository.crear({
      usuarioId: liquidacion.freelancerId,
      tipo: esPago ? 'retiro_aprobado' : 'retiro_rechazado',
      titulo,
      mensaje,
      enlace: `/api/freelancer/liquidaciones`,
    });

    return actualizada;
  }
}
