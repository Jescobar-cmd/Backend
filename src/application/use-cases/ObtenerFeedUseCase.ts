import { Feed } from '../../domain/entities/Feed';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { PublicacionRepository } from '../../domain/ports/repositories/PublicacionRepository';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { ROLES } from '../../shared/constants/roles';

/**
 * Caso de uso: armar el feed de inicio según el rol.
 * El cliente ve blog + servicios; el freelancer además ve ofertas abiertas.
 */
export class ObtenerFeedUseCase {
  constructor(
    private publicacionRepository: PublicacionRepository,
    private ofertaRepository: OfertaRepository,
    private servicioRepository: ServicioRepository
  ) {}

  async execute(usuarioId: number, rol: number, limite: number): Promise<Feed> {
    const [publicaciones, servicios] = await Promise.all([
      this.publicacionRepository.listar({ page: 1, limit: limite }, usuarioId),
      this.servicioRepository.listar({ page: 1, limit: limite }),
    ]);

    const ofertas =
      rol === ROLES.FREELANCER
        ? (await this.ofertaRepository.listarPublicas({ page: 1, limit: limite })).items
        : [];

    return {
      rol,
      publicaciones: publicaciones.items,
      ofertas,
      servicios: servicios.items,
    };
  }
}
