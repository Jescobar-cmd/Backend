import {
  DatosActualizacionEntrega,
  EntregaContrato,
} from '../../domain/entities/EntregaContrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { EntregaContratoRepository } from '../../domain/ports/repositories/EntregaContratoRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el freelancer reemplaza una entrega que aún está en revisión. */
export class ActualizarEntregaContratoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private entregaRepository: EntregaContratoRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    contratoId: number,
    entregaId: number,
    freelancerId: number,
    datos: DatosActualizacionEntrega
  ): Promise<EntregaContrato> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.freelancer.id !== freelancerId) {
      throw new ErrorProhibido('No eres el freelancer de este contrato');
    }
    if (contrato.estado !== 'activo') {
      throw new ErrorConflicto('El contrato ya no está activo');
    }

    const entrega = await this.entregaRepository.obtenerPorId(entregaId);
    if (!entrega || entrega.contratoId !== contratoId) {
      throw new ErrorNoEncontrado('Entrega no encontrada');
    }
    if (entrega.autorId !== freelancerId) {
      throw new ErrorProhibido('No puedes modificar esta entrega');
    }
    if (entrega.estado !== 'enviada') {
      throw new ErrorConflicto('Solo puedes modificar una entrega en revisión');
    }

    const actualizada = await this.entregaRepository.actualizar(entregaId, datos);

    await this.notificacionRepository.crear({
      usuarioId: contrato.cliente.id,
      tipo: 'entrega_actualizada',
      titulo: 'Entrega actualizada',
      mensaje: 'El freelancer actualizó la entrega pendiente de revisión.',
      enlace: `/contratos/${contrato.id}`,
    });

    return actualizada;
  }
}
