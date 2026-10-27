import { EstadoServicio, Servicio } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: activar / pausar / eliminar (lógico) un servicio propio. */
export class CambiarEstadoServicioUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async execute(
    freelancerId: number,
    servicioId: number,
    estado: EstadoServicio
  ): Promise<Servicio> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new NotFoundError('Servicio no encontrado');
    }
    if (servicio.freelancer.id !== freelancerId) {
      throw new ForbiddenError('No puedes cambiar el estado de un servicio que no es tuyo');
    }
    return this.servicioRepository.cambiarEstado(servicioId, estado);
  }
}
