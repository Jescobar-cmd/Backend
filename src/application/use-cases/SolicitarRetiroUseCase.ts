import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { ROLES } from '../../shared/constants/roles';
import { ErrorConflicto } from '../../shared/errors/ErrorAplicacion';

export interface RetiroSolicitado {
  cantidad: number;
  total: number;
}

/** Caso de uso: solicitar el retiro de todas las liquidaciones disponibles. */
export class SolicitarRetiroUseCase {
  constructor(
    private liquidacionRepository: LiquidacionRepository,
    private notificacionRepository: NotificacionRepository,
    private usuarioRepository: RepositorioUsuario
  ) {}

  async ejecutar(freelancerId: number): Promise<RetiroSolicitado> {
    const resultado = await this.liquidacionRepository.solicitarRetiro(freelancerId);
    if (resultado.cantidad === 0) {
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
