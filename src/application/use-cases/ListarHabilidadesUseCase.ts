import { Habilidad } from '../../domain/entities/Habilidad';
import { HabilidadRepository } from '../../domain/ports/repositories/HabilidadRepository';

/** Caso de uso: catálogo de habilidades para perfiles y ofertas. */
export class ListarHabilidadesUseCase {
  constructor(private habilidadRepository: HabilidadRepository) {}

  async ejecutar(): Promise<Habilidad[]> {
    return this.habilidadRepository.listar();
  }
}
