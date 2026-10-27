import { FiltrosOferta, OfertaPaginada } from '../../domain/entities/Oferta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';

/** Caso de uso: listar las ofertas del cliente autenticado (con filtros y paginación). */
export class ListarMisOfertasUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async ejecutar(clienteId: number, filtros: FiltrosOferta): Promise<OfertaPaginada> {
    return this.ofertaRepository.listarPorCliente(clienteId, filtros);
  }
}
