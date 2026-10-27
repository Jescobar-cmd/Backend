import { ContratoDetalle } from '../../entities/Contrato';

export interface ContratoRepository {
  /** Contratos donde el usuario es cliente o freelancer. */
  listar(usuarioId: number): Promise<ContratoDetalle[]>;

  obtener(contratoId: number): Promise<ContratoDetalle | null>;
}
