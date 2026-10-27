import { aContratoVista, ContratoVista } from '../../domain/entities/Contrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver el detalle de un contrato propio. */
export class ObtenerContratoUseCase {
  constructor(private contratoRepository: ContratoRepository) {}

  async ejecutar(contratoId: number, usuarioId: number): Promise<ContratoVista> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== usuarioId && contrato.freelancer.id !== usuarioId) {
      throw new ErrorProhibido('No participas en este contrato');
    }
    return aContratoVista(contrato, usuarioId);
  }
}
