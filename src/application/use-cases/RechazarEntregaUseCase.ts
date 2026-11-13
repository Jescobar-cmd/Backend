import { EntregaContrato } from '../../domain/entities/EntregaContrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { EntregaContratoRepository } from '../../domain/ports/repositories/EntregaContratoRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el cliente rechaza una entrega y deja una observación. */
export class RechazarEntregaUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private entregaRepository: EntregaContratoRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    contratoId: number,
    clienteId: number,
    observacion: string
  ): Promise<EntregaContrato> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== clienteId) {
      throw new ErrorProhibido('No eres el cliente de este contrato');
    }
    if (contrato.estado !== 'activo') {
      throw new ErrorConflicto('El contrato ya no está activo');
    }

    const entrega = await this.entregaRepository.obtenerPendiente(contratoId);
    if (!entrega) {
      throw new ErrorConflicto('No hay una entrega pendiente de revisión');
    }

    const rechazada = await this.entregaRepository.rechazar(
      entrega.id,
      clienteId,
      observacion
    );

    await this.notificacionRepository.crear({
      usuarioId: contrato.freelancer.id,
      tipo: 'entrega_rechazada',
      titulo: 'Entrega rechazada',
      mensaje: `El cliente rechazó la entrega: ${observacion}`,
      enlace: `/contratos/${contrato.id}`,
    });

    return rechazada;
  }
}
