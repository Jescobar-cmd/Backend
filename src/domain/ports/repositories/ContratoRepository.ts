import { ContratoDetalle, EstadoContratoFinal } from '../../entities/Contrato';

export interface ContratoRepository {
  /** Contratos donde el usuario es cliente o freelancer. */
  listar(usuarioId: number): Promise<ContratoDetalle[]>;

  obtener(contratoId: number): Promise<ContratoDetalle | null>;

  /** Cierra el contrato y sincroniza el estado de la oferta asociada. */
  cambiarEstado(
    contratoId: number,
    estado: EstadoContratoFinal
  ): Promise<ContratoDetalle>;
}
