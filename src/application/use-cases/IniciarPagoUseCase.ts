import { ContratoDetalle } from '../../domain/entities/Contrato';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { PasarelaPago } from '../../domain/ports/services/PasarelaPago';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
  ErrorServicioNoDisponible,
} from '../../shared/errors/ErrorAplicacion';

export interface PreferenciaIniciada {
  preferenciaId: string;
  initPoint: string;
  monto: number;
  simulado: boolean;
}

export interface ConfiguracionPago {
  frontendUrl: string;
  backendUrl: string;
  entornoProduccion: boolean;
}

/**
 * Caso de uso: el cliente inicia el pago del contrato en Mercado Pago.
 * El dinero queda pendiente hasta que el webhook confirme la aprobación.
 */
export class IniciarPagoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private pagoRepository: PagoRepository,
    private usuarioRepository: RepositorioUsuario,
    private pasarela: PasarelaPago,
    private configuracion: ConfiguracionPago
  ) {}

  async ejecutar(contratoId: number, clienteId: number): Promise<PreferenciaIniciada> {
    if (this.pasarela.esSimulada && this.configuracion.entornoProduccion) {
      throw new ErrorServicioNoDisponible(
        'La pasarela de pagos no está configurada en producción'
      );
    }

    const contrato = await this.obtenerContratoDelCliente(contratoId, clienteId);
    if (contrato.estado !== 'pendiente_pago') {
      throw new ErrorConflicto(
        contrato.estado === 'activo'
          ? 'El contrato ya tiene el pago confirmado'
          : 'El contrato no está pendiente de pago'
      );
    }

    const pago = await this.pagoRepository.obtenerPorContrato(contratoId);
    if (!pago) {
      throw new ErrorNoEncontrado('Pago del contrato no encontrado');
    }
    if (pago.estado !== 'pendiente') {
      throw new ErrorConflicto('El pago ya fue procesado');
    }

    const cliente = await this.usuarioRepository.buscarPorId(clienteId);
    if (!cliente) {
      throw new ErrorNoEncontrado('Cliente no encontrado');
    }

    const preferencia = await this.pasarela.crearPreferencia({
      contratoId,
      monto: pago.monto,
      descripcion: contrato.contexto.titulo ?? `Contrato #${contratoId} en FirstGig`,
      emailCliente: cliente.email,
      urlRetorno: `${this.configuracion.frontendUrl}/contratos/${contratoId}`,
      urlNotificacion: `${this.configuracion.backendUrl}/api/pagos/webhook`,
    });

    await this.pagoRepository.guardarPreferencia(contratoId, preferencia.id);

    return {
      preferenciaId: preferencia.id,
      initPoint: preferencia.initPoint,
      monto: pago.monto,
      simulado: this.pasarela.esSimulada,
    };
  }

  private async obtenerContratoDelCliente(
    contratoId: number,
    clienteId: number
  ): Promise<ContratoDetalle> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== clienteId) {
      throw new ErrorProhibido('No eres el cliente de este contrato');
    }
    return contrato;
  }
}
