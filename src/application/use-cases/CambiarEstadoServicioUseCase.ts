import { EstadoServicio, Servicio } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: activar / pausar / eliminar (lógico) un servicio propio. */
export class CambiarEstadoServicioUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async ejecutar(
    freelancerId: number,
    servicioId: number,
    estado: EstadoServicio
  ): Promise<Servicio> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('Servicio no encontrado');
    }
    if (servicio.freelancer.id !== freelancerId) {
      throw new ErrorProhibido('No puedes cambiar el estado de un servicio que no es tuyo');
    }
    return this.servicioRepository.cambiarEstado(servicioId, estado);
  }
}
