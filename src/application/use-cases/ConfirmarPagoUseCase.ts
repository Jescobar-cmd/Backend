import { PagoEscrow } from '../../domain/entities/Pago';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import { PasarelaPago } from '../../domain/ports/services/PasarelaPago';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export interface ResultadoConfirmacionPago {
  confirmado: boolean;
  pago: PagoEscrow | null;
}

/**
 * Caso de uso: concilia un pago aprobado en la pasarela y lo retiene en escrow.
 * Es idempotente: los webhooks de Mercado Pago pueden repetirse.
 */
export class ConfirmarPagoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private pagoRepository: PagoRepository,
    private notificacionRepository: NotificacionRepository,
    private pasarela: PasarelaPago
  ) {}

  async ejecutar(idPagoExterno: string): Promise<ResultadoConfirmacionPago> {
    const datos = await this.pasarela.consultarPago(idPagoExterno);

    if (datos.estado !== 'approved') {
      return { confirmado: false, pago: null };
    }

    const contratoId = Number(datos.referenciaExterna);
    if (!Number.isInteger(contratoId) || contratoId <= 0) {
      throw new ErrorNoEncontrado(
        'El pago no está asociado a un contrato de FirstGig'
      );
    }

    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato del pago no encontrado');
    }

    const pagoPrevio = await this.pagoRepository.obtenerPorContrato(contratoId);
    if (!pagoPrevio) {
      throw new ErrorNoEncontrado('Pago del contrato no encontrado');
    }

    const pago = await this.pagoRepository.confirmar(
      contratoId,
      datos.id,
      'mercado_pago'
    );

    // Si ya estaba retenido/liberado, el webhook es repetido: no se notifica dos veces.
    if (pagoPrevio.estado === 'pendiente') {
      await Promise.all([
        this.notificacionRepository.crear({
          usuarioId: contrato.cliente.id,
          tipo: 'pago_confirmado',
          titulo: 'Pago confirmado',
          mensaje:
            'Tu pago fue aprobado y quedó retenido por FirstGig hasta que apruebes la entrega.',
          enlace: `/contratos/${contrato.id}`,
        }),
        this.notificacionRepository.crear({
          usuarioId: contrato.freelancer.id,
          tipo: 'pago_confirmado',
          titulo: 'El cliente pagó el contrato',
          mensaje:
            'El pago quedó retenido en FirstGig. Puedes empezar a trabajar y entregar.',
          enlace: `/contratos/${contrato.id}`,
        }),
      ]);
    }

    return { confirmado: true, pago };
  }
}
