import { aContratoVista, ContratoVista } from '../../domain/entities/Contrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';

/** Caso de uso: listar mis contratos (como cliente o freelancer). */
export class ListarContratosUseCase {
  constructor(private contratoRepository: ContratoRepository) {}

  async ejecutar(usuarioId: number): Promise<ContratoVista[]> {
    const contratos = await this.contratoRepository.listar(usuarioId);
    return contratos.map((contrato) => aContratoVista(contrato, usuarioId));
  }
}
