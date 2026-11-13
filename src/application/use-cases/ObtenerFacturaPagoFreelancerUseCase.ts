import { FacturaCliente } from '../../domain/entities/Pago';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: consultar la factura de un pago propio del freelancer. */
export class ObtenerFacturaPagoFreelancerUseCase {
  constructor(private pagoRepository: PagoRepository) {}

  async ejecutar(pagoId: number, freelancerId: number): Promise<FacturaCliente> {
    const factura = await this.pagoRepository.obtenerFacturaFreelancer(
      pagoId,
      freelancerId
    );
    if (!factura) {
      throw new ErrorNoEncontrado('Factura no encontrada');
    }
    return factura;
  }
}
