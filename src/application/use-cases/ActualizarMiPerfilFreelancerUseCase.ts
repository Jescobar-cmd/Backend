import { DatosPerfilFreelancer, PerfilFreelancer } from '../../domain/entities/Perfil';
import { HabilidadRepository } from '../../domain/ports/repositories/HabilidadRepository';
import { PerfilRepository } from '../../domain/ports/repositories/PerfilRepository';
import { ErrorNoEncontrado, ErrorValidacion } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: actualizar el perfil propio del freelancer y sus habilidades. */
export class ActualizarMiPerfilFreelancerUseCase {
  constructor(
    private perfilRepository: PerfilRepository,
    private habilidadRepository: HabilidadRepository
  ) {}

  async ejecutar(
    usuarioId: number,
    datos: DatosPerfilFreelancer
  ): Promise<PerfilFreelancer> {
    let datosActualizados = datos;

    if (datos.habilidadIds !== undefined) {
      const idsUnicos = [...new Set(datos.habilidadIds)];
      const habilidades = await this.habilidadRepository.buscarPorIds(idsUnicos);
      if (habilidades.length !== idsUnicos.length) {
        throw new ErrorValidacion('Una o más habilidades no existen');
      }
      datosActualizados = { ...datos, habilidadIds: idsUnicos };
    }

    const perfil = await this.perfilRepository.actualizarPerfilFreelancer(
      usuarioId,
      datosActualizados
    );
    if (!perfil) {
      throw new ErrorNoEncontrado('Perfil de freelancer no encontrado');
    }
    return perfil;
  }
}
