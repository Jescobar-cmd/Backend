import { Calificacion, NuevaCalificacion } from '../../entities/Calificacion';

export interface CalificacionRepository {
  /** Crea la calificación y recalcula el promedio del freelancer si corresponde. */
  crear(datos: NuevaCalificacion): Promise<Calificacion>;

  listarPorContrato(contratoId: number): Promise<Calificacion[]>;

  buscarPorContratoYCalificador(
    contratoId: number,
    calificadorId: number
  ): Promise<Calificacion | null>;
}
