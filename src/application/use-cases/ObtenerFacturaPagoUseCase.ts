import { FacturaCliente } from '../../domain/entities/Pago';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: consultar la factura de un pago propio. */
export class ObtenerFacturaPagoUseCase {
  constructor(private pagoRepository: PagoRepository) {}

  async ejecutar(pagoId: number, clienteId: number): Promise<FacturaCliente> {
    const factura = await this.pagoRepository.obtenerFactura(pagoId, clienteId);
    if (!factura) {
      throw new ErrorNoEncontrado('Factura no encontrada');
    }
    return factura;
  }
}
