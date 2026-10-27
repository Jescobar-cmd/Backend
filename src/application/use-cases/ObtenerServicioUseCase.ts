import { Servicio } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: ver el detalle de un servicio. */
export class ObtenerServicioUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async execute(servicioId: number): Promise<Servicio> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new NotFoundError('Servicio no encontrado');
    }
    return servicio;
  }
}
