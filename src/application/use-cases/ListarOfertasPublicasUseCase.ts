import { FiltrosOfertaPublica, OfertaPublicaPaginada } from '../../domain/entities/Oferta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';

/** Caso de uso: marketplace de ofertas abiertas (para freelancers). */
export class ListarOfertasPublicasUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async execute(filtros: FiltrosOfertaPublica): Promise<OfertaPublicaPaginada> {
    return this.ofertaRepository.listarPublicas(filtros);
  }
}
