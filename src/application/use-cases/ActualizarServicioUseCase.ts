import { DatosServicio, Servicio } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { ErrorSolicitudInvalida, ErrorProhibido, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: un freelancer edita un servicio suyo. */
export class ActualizarServicioUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async ejecutar(
    freelancerId: number,
    servicioId: number,
    datos: DatosServicio
  ): Promise<Servicio> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('Servicio no encontrado');
    }
    if (servicio.freelancer.id !== freelancerId) {
      throw new ErrorProhibido('No puedes editar un servicio que no es tuyo');
    }
    if (datos.categoriaId !== undefined && datos.categoriaId !== null) {
      const existe = await this.servicioRepository.categoriaExiste(datos.categoriaId);
      if (!existe) {
        throw new ErrorSolicitudInvalida('La categoría indicada no existe');
      }
    }
    return this.servicioRepository.actualizar(servicioId, datos);
  }
}
