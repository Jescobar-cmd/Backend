import { DatosPortafolioItem, PortafolioItem } from '../../domain/entities/PortafolioItem';
import { PortafolioRepository } from '../../domain/ports/repositories/PortafolioRepository';
import { ErrorNoEncontrado, ErrorProhibido } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: editar un ítem del portafolio propio. */
export class ActualizarPortafolioItemUseCase {
  constructor(private portafolioRepository: PortafolioRepository) {}

  async ejecutar(
    freelancerId: number,
    itemId: number,
    datos: DatosPortafolioItem
  ): Promise<PortafolioItem> {
    const item = await this.portafolioRepository.obtenerPorId(itemId);
    if (!item) {
      throw new ErrorNoEncontrado('Ítem de portafolio no encontrado');
    }
    if (item.freelancerId !== freelancerId) {
      throw new ErrorProhibido('No puedes editar un ítem de portafolio que no es tuyo');
    }
    return this.portafolioRepository.actualizar(itemId, datos);
  }
}
