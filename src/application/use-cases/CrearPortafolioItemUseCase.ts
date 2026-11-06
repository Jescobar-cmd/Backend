import { NuevoPortafolioItem, PortafolioItem } from '../../domain/entities/PortafolioItem';
import { PortafolioRepository } from '../../domain/ports/repositories/PortafolioRepository';

/** Caso de uso: agregar un ítem al portafolio propio. */
export class CrearPortafolioItemUseCase {
  constructor(private portafolioRepository: PortafolioRepository) {}

  async ejecutar(
    freelancerId: number,
    datos: NuevoPortafolioItem
  ): Promise<PortafolioItem> {
    return this.portafolioRepository.crear(freelancerId, datos);
  }
}
