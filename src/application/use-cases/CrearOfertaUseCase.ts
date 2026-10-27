import { NuevaOferta, Oferta } from '../../domain/entities/Oferta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { ErrorSolicitudInvalida } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el cliente publica una nueva oferta (proyecto). */
export class CrearOfertaUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async ejecutar(clienteId: number, datos: NuevaOferta): Promise<Oferta> {
    if (datos.categoriaId !== undefined && datos.categoriaId !== null) {
      const existe = await this.ofertaRepository.categoriaExiste(datos.categoriaId);
      if (!existe) {
        throw new ErrorSolicitudInvalida('La categoría indicada no existe');
      }
    }
    if (datos.habilidadIds && datos.habilidadIds.length > 0) {
      const validas = await this.ofertaRepository.habilidadesValidas(datos.habilidadIds);
      if (!validas) {
        throw new ErrorSolicitudInvalida('Una o más habilidades indicadas no existen');
      }
    }
    return this.ofertaRepository.crear(clienteId, datos);
  }
}
