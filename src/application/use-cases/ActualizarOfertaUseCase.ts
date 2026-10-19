import { DatosOferta, Oferta } from '../../domain/entities/Oferta';
import { OfertaRepository } from '../../domain/ports/repositories/OfertaRepository';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors/AppError';

/** Caso de uso: editar una oferta propia (solo si está abierta). */
export class ActualizarOfertaUseCase {
  constructor(private ofertaRepository: OfertaRepository) {}

  async execute(clienteId: number, ofertaId: number, datos: DatosOferta): Promise<Oferta> {
    const oferta = await this.ofertaRepository.obtenerPorId(clienteId, ofertaId);
    if (!oferta) {
      throw new NotFoundError('Oferta no encontrada');
    }
    if (oferta.estado !== 'abierto') {
      throw new ConflictError('Solo se puede editar una oferta que esté abierta');
    }

    if (datos.categoriaId !== undefined && datos.categoriaId !== null) {
      const existe = await this.ofertaRepository.categoriaExiste(datos.categoriaId);
      if (!existe) {
        throw new BadRequestError('La categoría indicada no existe');
      }
    }
    if (datos.habilidadIds && datos.habilidadIds.length > 0) {
      const validas = await this.ofertaRepository.habilidadesValidas(datos.habilidadIds);
      if (!validas) {
        throw new BadRequestError('Una o más habilidades indicadas no existen');
      }
    }

    return this.ofertaRepository.actualizar(clienteId, ofertaId, datos);
  }
}
