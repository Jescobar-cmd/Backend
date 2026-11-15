import { Proyecto } from '../../entities/Proyecto';

export interface FiltrosProyecto {
  estado?: string;
  texto?: string;
  page: number;
  limit: number;
}

/**
 * Puerto del repositorio de proyectos (bolsa de trabajo del cliente).
 * Usado por el módulo de moderación para revisar publicaciones.
 */
export interface ProyectoRepository {
  obtenerPorId(id: number): Promise<Proyecto | null>;

  /** Listado con paginación real; devuelve el total junto a los items. */
  listar(filtros: FiltrosProyecto): Promise<{ items: Proyecto[]; total: number }>;

  cambiarEstado(proyectoId: number, estado: string): Promise<Proyecto>;

  /** Marca o limpia los campos de moderación sin tocar el estado público. */
  actualizarModeracion(
    proyectoId: number,
    datos: {
      moderacionRetirada: boolean;
      moderacionEstadoAnterior: string | null;
      moderacionMotivo: string | null;
    }
  ): Promise<Proyecto>;
}
