import { PagoFreelancer } from '../../domain/entities/Pago';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';

/** Caso de uso: listar los pagos y facturas del freelancer autenticado. */
export class ListarPagosFreelancerUseCase {
  constructor(private pagoRepository: PagoRepository) {}

  async ejecutar(freelancerId: number): Promise<PagoFreelancer[]> {
    return this.pagoRepository.listarPorFreelancer(freelancerId);
  }
}
