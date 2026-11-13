import { EntregaContrato } from '../../domain/entities/EntregaContrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { EntregaContratoRepository } from '../../domain/ports/repositories/EntregaContratoRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

export interface DatosEntrega {
  mensaje?: string | null;
  archivoUrl?: string | null;
  enlaceUrl?: string | null;
}

/** Caso de uso: el freelancer registra la entrega de un contrato activo. */
export class RegistrarEntregaContratoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private entregaRepository: EntregaContratoRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    contratoId: number,
    freelancerId: number,
    datos: DatosEntrega
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

    const pendiente = await this.entregaRepository.obtenerPendiente(contratoId);
    if (pendiente) {
      throw new ErrorConflicto('Ya existe una entrega pendiente de revisión');
    }

    const entrega = await this.entregaRepository.crear({
      contratoId,
      autorId: freelancerId,
      mensaje: datos.mensaje ?? null,
      archivoUrl: datos.archivoUrl ?? null,
      enlaceUrl: datos.enlaceUrl ?? null,
    });

    await this.notificacionRepository.crear({
      usuarioId: contrato.cliente.id,
      tipo: 'entrega_enviada',
      titulo: 'Nueva entrega recibida',
      mensaje: 'El freelancer envió una entrega para tu revisión.',
      enlace: `/contratos/${contrato.id}`,
    });

    return entrega;
  }
}
