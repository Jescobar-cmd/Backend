import { PagoEscrow } from '../../domain/entities/Pago';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import { PasarelaPago } from '../../domain/ports/services/PasarelaPago';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/**
 * Caso de uso SOLO para desarrollo/pruebas: confirma el pago sin Mercado Pago.
 * En producción está prohibido.
 */
export class SimularPagoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private pagoRepository: PagoRepository,
    private notificacionRepository: NotificacionRepository,
    private pasarela: PasarelaPago,
    private entornoProduccion: boolean
  ) {}

  async ejecutar(contratoId: number, clienteId: number): Promise<PagoEscrow> {
    if (!this.pasarela.esSimulada || this.entornoProduccion) {
      throw new ErrorProhibido(
        'La simulación de pagos solo está disponible en desarrollo'
      );
    }

    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== clienteId) {
      throw new ErrorProhibido('No eres el cliente de este contrato');
    }
    if (contrato.estado !== 'pendiente_pago') {
      throw new ErrorConflicto('El contrato no está pendiente de pago');
    }

    const pagoPrevio = await this.pagoRepository.obtenerPorContrato(contratoId);
    if (!pagoPrevio) {
      throw new ErrorNoEncontrado('Pago del contrato no encontrado');
    }

    const pago = await this.pagoRepository.confirmar(
      contratoId,
      `sim-${contratoId}-${Date.now()}`,
      'simulado'
    );

    if (pagoPrevio.estado === 'pendiente') {
      await Promise.all([
        this.notificacionRepository.crear({
          usuarioId: contrato.cliente.id,
          tipo: 'pago_confirmado',
          titulo: 'Pago simulado confirmado',
          mensaje:
            'El pago de prueba quedó retenido. Aprueba la entrega para liberarlo.',
          enlace: `/contratos/${contrato.id}`,
        }),
        this.notificacionRepository.crear({
          usuarioId: contrato.freelancer.id,
          tipo: 'pago_confirmado',
          titulo: 'El cliente pagó (simulación)',
          mensaje: 'El pago de prueba quedó retenido en FirstGig.',
          enlace: `/contratos/${contrato.id}`,
        }),
      ]);
    }

    return pago;
  }
}
