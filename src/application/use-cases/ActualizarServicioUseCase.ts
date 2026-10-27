import { DatosServicio, Servicio } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: un freelancer edita un servicio suyo. */
export class ActualizarServicioUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async execute(
    freelancerId: number,
    servicioId: number,
    datos: DatosServicio
  ): Promise<Servicio> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new NotFoundError('Servicio no encontrado');
    }
    if (servicio.freelancer.id !== freelancerId) {
      throw new ForbiddenError('No puedes editar un servicio que no es tuyo');
    }
    if (datos.categoriaId !== undefined && datos.categoriaId !== null) {
      const existe = await this.servicioRepository.categoriaExiste(datos.categoriaId);
      if (!existe) {
        throw new BadRequestError('La categoría indicada no existe');
      }
    }
    return this.servicioRepository.actualizar(servicioId, datos);
  }
}
