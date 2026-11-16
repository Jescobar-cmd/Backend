import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { ROLES } from '../../shared/constants/roles';
import { ErrorConflicto } from '../../shared/errors/ErrorAplicacion';

export interface RetiroSolicitado {
  cantidad: number;
  total: number;
  /** Monto que sigue en periodo de validación y no se retiró. */
  enValidacion?: number;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Caso de uso: solicitar el retiro de liquidaciones ya validadas. */
export class SolicitarRetiroUseCase {
  constructor(
    private liquidacionRepository: LiquidacionRepository,
    private notificacionRepository: NotificacionRepository,
    private usuarioRepository: RepositorioUsuario,
    private diasValidacion = 3
  ) {}

  async ejecutar(freelancerId: number): Promise<RetiroSolicitado> {
    const corte =
      this.diasValidacion > 0
        ? new Date(Date.now() - this.diasValidacion * MS_POR_DIA)
        : undefined;
    const resultado = await this.liquidacionRepository.solicitarRetiro(
      freelancerId,
      corte
    );
    if (resultado.cantidad === 0) {
      if ((resultado.enValidacion ?? 0) > 0) {
        throw new ErrorConflicto(
          `Tu saldo está en periodo de validación de ${this.diasValidacion} días; podrás retirarlo cuando termine`
        );
      }
      throw new ErrorConflicto('No tienes saldo disponible para retirar');
    }

    const moderadores = await this.usuarioRepository.listarIdsPorRoles([
      ROLES.ADMIN,
      ROLES.MODERADOR,
    ]);
    await Promise.all(
      moderadores.map((moderadorId) =>
        this.notificacionRepository.crear({
          usuarioId: moderadorId,
          tipo: 'retiro_solicitado',
          titulo: 'Nueva solicitud de retiro',
          mensaje: `El freelancer #${freelancerId} solicitó un retiro por ${resultado.total}.`,
          enlace: '/api/moderador/liquidaciones?estado=solicitada',
        })
      )
    );

    return resultado;
  }
}
