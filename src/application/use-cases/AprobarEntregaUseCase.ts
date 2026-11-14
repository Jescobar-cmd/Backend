import { aContratoVista, ContratoVista } from '../../domain/entities/Contrato';
import { EntregaContrato } from '../../domain/entities/EntregaContrato';
import { calcularLiquidacion } from '../../domain/entities/Liquidacion';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import { EntregaContratoRepository } from '../../domain/ports/repositories/EntregaContratoRepository';
import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

export interface AprobacionEntrega {
  contrato: ContratoVista;
  entrega: EntregaContrato;
}

/**
 * Caso de uso: el cliente aprueba la entrega, el escrow libera el dinero
 * al freelancer y el contrato queda completado.
 */
export class AprobarEntregaUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private entregaRepository: EntregaContratoRepository,
    private notificacionRepository: NotificacionRepository,
    private pagoRepository: PagoRepository,
    private disputaRepository: DisputaRepository,
    private liquidacionRepository: LiquidacionRepository,
    private comisionFreelancerPorcentaje: number
  ) {}

  async ejecutar(contratoId: number, clienteId: number): Promise<AprobacionEntrega> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== clienteId) {
      throw new ErrorProhibido('No eres el cliente de este contrato');
    }
    if (contrato.estado !== 'activo') {
      throw new ErrorConflicto('El contrato ya no está activo');
    }

    const pago = await this.pagoRepository.obtenerPorContrato(contratoId);
    if (!pago || pago.estado !== 'retenido') {
      throw new ErrorConflicto(
        'El pago del contrato debe estar retenido antes de aprobar la entrega'
      );
    }

    if (await this.disputaRepository.existeAbierta(contratoId)) {
      throw new ErrorConflicto(
        'No puedes aprobar la entrega mientras exista una disputa abierta'
      );
    }

    const entrega = await this.entregaRepository.obtenerPendiente(contratoId);
    if (!entrega) {
      throw new ErrorConflicto('No hay una entrega pendiente de aprobación');
    }

    const entregaAprobada = await this.entregaRepository.aprobar(entrega.id, clienteId);

    // Escrow: el dinero retenido pasa al freelancer.
    await this.pagoRepository.liberar(contratoId);

    const contratoCompletado = await this.contratoRepository.cambiarEstado(
      contratoId,
      'completado'
    );

    const calculo = calcularLiquidacion(
      contrato.montoAcordado,
      this.comisionFreelancerPorcentaje
    );
    await this.liquidacionRepository.crearParaContrato({
      freelancerId: contrato.freelancer.id,
      contratoId: contrato.id,
      montoBruto: contrato.montoAcordado,
      comision: calculo.comision,
      montoNeto: calculo.montoNeto,
    });

    await this.notificacionRepository.crear({
      usuarioId: contrato.freelancer.id,
      tipo: 'entrega_aprobada',
      titulo: 'Entrega aprobada y pago liberado',
      mensaje:
        'El cliente aprobó tu entrega, el contrato quedó completado y el dinero está disponible en tus liquidaciones.',
      enlace: `/contratos/${contrato.id}`,
    });

    return {
      contrato: aContratoVista(contratoCompletado, clienteId),
      entrega: entregaAprobada,
    };
  }
}
