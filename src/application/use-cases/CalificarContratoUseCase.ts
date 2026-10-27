import { Calificacion } from '../../domain/entities/Calificacion';
import { CalificacionRepository } from '../../domain/ports/repositories/CalificacionRepository';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

export interface DatosCalificacion {
  puntuacion: number;
  comentario?: string | null;
}

/** Caso de uso: una parte califica a la otra después de completar el contrato. */
export class CalificarContratoUseCase {
  constructor(
    private calificacionRepository: CalificacionRepository,
    private contratoRepository: ContratoRepository
  ) {}

  async ejecutar(
    contratoId: number,
    calificadorId: number,
    datos: DatosCalificacion
  ): Promise<Calificacion> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }

    const esCliente = contrato.cliente.id === calificadorId;
    const esFreelancer = contrato.freelancer.id === calificadorId;
    if (!esCliente && !esFreelancer) {
      throw new ErrorProhibido('No participas en este contrato');
    }
    if (contrato.estado !== 'completado') {
      throw new ErrorConflicto('Solo puedes calificar un contrato completado');
    }

    const existente = await this.calificacionRepository.buscarPorContratoYCalificador(
      contratoId,
      calificadorId
    );
    if (existente) {
      throw new ErrorConflicto('Ya calificaste este contrato');
    }

    const calificadoId = esCliente ? contrato.freelancer.id : contrato.cliente.id;
    return this.calificacionRepository.crear({
      contratoId,
      calificadorId,
      calificadoId,
      puntuacion: datos.puntuacion,
      comentario: datos.comentario ?? null,
    });
  }
}
