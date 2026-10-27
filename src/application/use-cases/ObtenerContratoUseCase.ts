import { aContratoVista, ContratoVista } from '../../domain/entities/Contrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: ver el detalle de un contrato propio. */
export class ObtenerContratoUseCase {
  constructor(private contratoRepository: ContratoRepository) {}

  async execute(contratoId: number, usuarioId: number): Promise<ContratoVista> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new NotFoundError('Contrato no encontrado');
    }
    if (contrato.cliente.id !== usuarioId && contrato.freelancer.id !== usuarioId) {
      throw new ForbiddenError('No participas en este contrato');
    }
    return aContratoVista(contrato, usuarioId);
  }
}
