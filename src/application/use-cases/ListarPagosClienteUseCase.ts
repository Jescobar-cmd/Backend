import { PagoCliente } from '../../domain/entities/Pago';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';

/** Caso de uso: listar los pagos y facturas del cliente autenticado. */
export class ListarPagosClienteUseCase {
  constructor(private pagoRepository: PagoRepository) {}

  async ejecutar(clienteId: number): Promise<PagoCliente[]> {
    return this.pagoRepository.listarPorCliente(clienteId);
  }
}
