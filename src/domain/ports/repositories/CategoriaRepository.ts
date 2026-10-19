import { Categoria } from '../../entities/Categoria';

/** Puerto del catálogo de categorías. */
export interface CategoriaRepository {
  listar(): Promise<Categoria[]>;
}
