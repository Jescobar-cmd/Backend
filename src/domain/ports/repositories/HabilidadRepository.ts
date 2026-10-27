import { Habilidad } from '../../entities/Habilidad';

export interface HabilidadRepository {
  /** Catálogo completo, ordenado por nombre. */
  listar(): Promise<Habilidad[]>;

  /** Habilidades existentes para validar una asignación. */
  buscarPorIds(ids: number[]): Promise<Habilidad[]>;
}
