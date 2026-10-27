import {
  aContratoVista,
  ContratoVista,
  EstadoContratoFinal,
} from '../../domain/entities/Contrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: un participante cierra el contrato como completado o cancelado. */
export class CambiarEstadoContratoUseCase {
  constructor(private contratoRepository: ContratoRepository) {}

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
    if (contrato.estado !== 'activo') {
      throw new ErrorConflicto('El contrato ya no está activo');
    }

    const actualizado = await this.contratoRepository.cambiarEstado(contratoId, estado);
    return aContratoVista(actualizado, usuarioId);
  }
}
