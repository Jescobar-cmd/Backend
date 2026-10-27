import { NuevaPublicacion, Publicacion } from '../../domain/entities/Publicacion';
import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';

/** Caso de uso: un usuario publica una entrada en el blog. */
export class CrearPublicacionUseCase {
  constructor(private publicacionRepository: PublicacionRepository) {}

  async ejecutar(autorId: number, datos: NuevaPublicacion): Promise<Publicacion> {
    return this.publicacionRepository.crear(autorId, datos);
  }
}
