import {
  aContratoVista,
  ContratoVista,
  EstadoContratoFinal,
} from '../../domain/entities/Contrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/**
 * Caso de uso: cancelar un contrato que todavía no tiene pago confirmado.
 * Completar un contrato ya no se hace por aquí: lo hace la aprobación de
 * entrega, que es la única que puede liberar el dinero del escrow.
 */
export class CambiarEstadoContratoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    contratoId: number,
    usuarioId: number,
    estado: EstadoContratoFinal
  ): Promise<ContratoVista> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== usuarioId && contrato.freelancer.id !== usuarioId) {
      throw new ErrorProhibido('No participas en este contrato');
    }
    if (estado === 'completado') {
      throw new ErrorConflicto(
        'El contrato solo se completa cuando el cliente aprueba la entrega'
      );
    }
    if (contrato.estado !== 'pendiente_pago') {
      throw new ErrorConflicto(
        contrato.estado === 'activo'
          ? 'El contrato ya tiene pago retenido; abre una disputa para resolverlo'
          : 'El contrato ya no se puede cancelar'
      );
    }

    const actualizado = await this.contratoRepository.cambiarEstado(contratoId, 'cancelado');

    await this.notificacionRepository.crear({
      usuarioId:
        contrato.cliente.id === usuarioId
          ? contrato.freelancer.id
          : contrato.cliente.id,
      tipo: 'contrato_cancelado',
      titulo: 'Contrato cancelado',
      mensaje: 'El contrato fue cancelado antes de recibir el pago.',
      enlace: `/contratos/${contrato.id}`,
    });

    return aContratoVista(actualizado, usuarioId);
  }
}
