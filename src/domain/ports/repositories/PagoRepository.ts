import { FacturaCliente, PagoCliente } from '../../entities/Pago';

export interface PagoRepository {
  listarPorCliente(clienteId: number): Promise<PagoCliente[]>;

  obtenerFactura(pagoId: number, clienteId: number): Promise<FacturaCliente | null>;
}
