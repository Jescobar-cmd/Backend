import { Disputa } from '../../domain/entities/Disputa';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

export interface DatosDisputa {
  motivo: string;
  descripcion: string;
  evidenciaUrl?: string | null;
}

/** Caso de uso: una parte abre una disputa formal sobre un contrato activo. */
export class AbrirDisputaUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private disputaRepository: DisputaRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    contratoId: number,
    usuarioId: number,
    datos: DatosDisputa
  ): Promise<Disputa> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }

    const esCliente = contrato.cliente.id === usuarioId;
    const esFreelancer = contrato.freelancer.id === usuarioId;
    if (!esCliente && !esFreelancer) {
      throw new ErrorProhibido('No participas en este contrato');
    }
    if (contrato.estado !== 'activo') {
      throw new ErrorConflicto('Solo puedes disputar un contrato activo');
    }
    if (await this.disputaRepository.existeAbierta(contratoId)) {
      throw new ErrorConflicto('El contrato ya tiene una disputa abierta');
    }

    const disputa = await this.disputaRepository.crear({
      contratoId,
      abiertaPorId: usuarioId,
      motivo: datos.motivo,
      descripcion: datos.descripcion,
      evidenciaUrl: datos.evidenciaUrl ?? null,
    });

    await this.notificacionRepository.crear({
      usuarioId: esCliente ? contrato.freelancer.id : contrato.cliente.id,
      tipo: 'disputa_abierta',
      titulo: 'Disputa abierta',
      mensaje: `Se abrió una disputa en el contrato por: ${datos.motivo}.`,
      enlace: `/contratos/${contrato.id}`,
    });

    return disputa;
  }
}
