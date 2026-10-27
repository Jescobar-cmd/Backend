import { ContratoDetalle } from '../../entities/Contrato';
import { NuevaPropuesta, PropuestaDetalle, PropuestaResumen } from '../../entities/Propuesta';

export interface PropuestaRepository {
  /** El adaptador asegura la fila Freelancer (upsert) antes de crear. */
  crear(freelancerId: number, proyectoId: number, datos: NuevaPropuesta): Promise<PropuestaResumen>;

  listarPorFreelancer(freelancerId: number): Promise<PropuestaResumen[]>;

  obtenerDetalle(propuestaId: number): Promise<PropuestaDetalle | null>;

  /** Acepta en transacción: propuesta, demás propuestas, proyecto y contrato. */
  aceptar(propuestaId: number): Promise<ContratoDetalle>;

  rechazar(propuestaId: number): Promise<void>;
}
