import { Categoria } from '../../domain/entities/Categoria';
import { CategoriaRepository } from '../../domain/ports/repositories/CategoriaRepository';

/** Caso de uso: listar el catálogo de categorías (para los formularios). */
export class ListarCategoriasUseCase {
  constructor(private categoriaRepository: CategoriaRepository) {}

  async execute(): Promise<Categoria[]> {
    return this.categoriaRepository.listar();
  }
}
