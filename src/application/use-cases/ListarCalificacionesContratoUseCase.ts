import { Calificacion } from '../../domain/entities/Calificacion';
import { CalificacionRepository } from '../../domain/ports/repositories/CalificacionRepository';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { ErrorNoEncontrado, ErrorProhibido } from '../../shared/errors/ErrorAplicacion';

export interface CalificacionesContrato {
  total: number;
  calificaciones: Calificacion[];
  miCalificacion: Calificacion | null;
}

/** Caso de uso: listar las calificaciones de un contrato propio. */
export class ListarCalificacionesContratoUseCase {
  constructor(
    private calificacionRepository: CalificacionRepository,
    private contratoRepository: ContratoRepository
  ) {}

  async ejecutar(
    contratoId: number,
    usuarioId: number
  ): Promise<CalificacionesContrato> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== usuarioId && contrato.freelancer.id !== usuarioId) {
      throw new ErrorProhibido('No participas en este contrato');
    }

    const calificaciones = await this.calificacionRepository.listarPorContrato(contratoId);
    const miCalificacion =
      calificaciones.find((calificacion) => calificacion.calificador.id === usuarioId) ??
      null;

    return {
      total: calificaciones.length,
      calificaciones,
      miCalificacion,
    };
  }
}
