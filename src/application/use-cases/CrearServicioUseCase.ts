import { NuevoServicio, Servicio } from '../../domain/entities/Servicio';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import { ErrorSolicitudInvalida } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: un freelancer publica un servicio. */
export class CrearServicioUseCase {
  constructor(private servicioRepository: ServicioRepository) {}

  async ejecutar(freelancerId: number, datos: NuevoServicio): Promise<Servicio> {
    if (datos.categoriaId !== undefined && datos.categoriaId !== null) {
      const existe = await this.servicioRepository.categoriaExiste(datos.categoriaId);
      if (!existe) {
        throw new ErrorSolicitudInvalida('La categoría indicada no existe');
      }
    }
    return this.servicioRepository.crear(freelancerId, datos);
  }
}
