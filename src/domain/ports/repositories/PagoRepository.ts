import {
  FacturaCliente,
  PagoCliente,
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
}
