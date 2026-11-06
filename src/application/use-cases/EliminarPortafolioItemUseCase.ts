import { PortafolioRepository } from '../../domain/ports/repositories/PortafolioRepository';
import { ErrorNoEncontrado, ErrorProhibido } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: eliminar un ítem del portafolio propio. */
export class EliminarPortafolioItemUseCase {
  constructor(private portafolioRepository: PortafolioRepository) {}

  async ejecutar(freelancerId: number, itemId: number): Promise<void> {
    const item = await this.portafolioRepository.obtenerPorId(itemId);
    if (!item) {
      throw new ErrorNoEncontrado('Ítem de portafolio no encontrado');
    }
    if (item.freelancerId !== freelancerId) {
      throw new ErrorProhibido('No puedes eliminar un ítem de portafolio que no es tuyo');
    }
    await this.portafolioRepository.eliminar(itemId);
  }
}
