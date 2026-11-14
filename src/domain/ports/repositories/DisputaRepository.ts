import { Disputa, EstadoDisputa, NuevaDisputa } from '../../entities/Disputa';

export interface FiltrosDisputa {
  estado?: EstadoDisputa;
  page: number;
  limit: number;
}

export interface DisputaRepository {
  crear(datos: NuevaDisputa): Promise<Disputa>;

  listarPorContrato(contratoId: number): Promise<Disputa[]>;

  listar(filtros: {
    estado?: EstadoDisputa;
    page: number;
    limit: number;
  }): Promise<Disputa[]>;

  contar(filtros: Omit<FiltrosDisputa, 'page' | 'limit'>): Promise<number>;

  obtenerPorId(id: number): Promise<Disputa | null>;

  existeAbierta(contratoId: number): Promise<boolean>;

  resolver(
    id: number,
    adminId: number,
    estado: EstadoDisputa,
    resolucion: string
  ): Promise<Disputa>;

  /** El moderador toma la disputa y la deja en revisión. */
  marcarEnRevision(id: number, adminId: number): Promise<Disputa>;
}
