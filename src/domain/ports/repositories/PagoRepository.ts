import {
  FacturaCliente,
  PagoCliente,
  PagoEscrow,
  PagoFreelancer,
} from '../../entities/Pago';

export interface PagoRepository {
  listarPorCliente(clienteId: number): Promise<PagoCliente[]>;

  listarPorFreelancer(freelancerId: number): Promise<PagoFreelancer[]>;

  obtenerFactura(pagoId: number, clienteId: number): Promise<FacturaCliente | null>;

  obtenerFacturaFreelancer(
    pagoId: number,
    freelancerId: number
  ): Promise<FacturaCliente | null>;

  /** Pago asociado a un contrato (cada contrato tiene un único pago). */
  obtenerPorContrato(contratoId: number): Promise<PagoEscrow | null>;

  /** Guarda el id de la preferencia de Mercado Pago sin mover dinero. */
  guardarPreferencia(contratoId: number, preferenciaId: string): Promise<void>;

  /**
   * Confirma el pago aprobado por la pasarela y lo deja retenido en escrow.
   * En una sola transacción activa el contrato y marca la factura como pagada.
   * Es idempotente: si el pago ya estaba retenido/liberado no vuelve a moverlo.
   */
  confirmar(
    contratoId: number,
    referenciaPasarela: string,
    metodoPago: string
  ): Promise<PagoEscrow>;

  /** Libera el dinero retenido hacia el freelancer. */
  liberar(contratoId: number): Promise<PagoEscrow>;

  /** Devuelve el dinero retenido al cliente. */
  reembolsar(contratoId: number): Promise<PagoEscrow>;
}
