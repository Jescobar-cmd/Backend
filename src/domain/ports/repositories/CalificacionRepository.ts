import { Calificacion, NuevaCalificacion } from '../../entities/Calificacion';

export interface CalificacionRepository {
  /** Crea la calificación y recalcula el promedio del freelancer si corresponde. */
  crear(datos: NuevaCalificacion): Promise<Calificacion>;

  listarPorContrato(contratoId: number): Promise<Calificacion[]>;

  /** Calificaciones recibidas por un usuario, de la más reciente a la más antigua. */
  listarPorCalificado(calificadoId: number, limite?: number): Promise<Calificacion[]>;

  buscarPorContratoYCalificador(
    contratoId: number,
    calificadorId: number
  ): Promise<Calificacion | null>;
}
