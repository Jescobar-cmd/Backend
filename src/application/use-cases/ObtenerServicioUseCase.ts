import { Servicio } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ver el detalle de un servicio. */
export class ObtenerServicioUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async ejecutar(servicioId: number): Promise<Servicio> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('Servicio no encontrado');
    }
    return servicio;
  }
}
