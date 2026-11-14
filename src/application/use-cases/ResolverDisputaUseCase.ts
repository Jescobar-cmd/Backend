import { Disputa, EstadoDisputa } from '../../domain/entities/Disputa';
import { calcularLiquidacion } from '../../domain/entities/Liquidacion';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { PagoRepository } from '../../domain/ports/repositories/PagoRepository';
import { PasarelaPago } from '../../domain/ports/services/PasarelaPago';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorValidacion,
} from '../../shared/errors/ErrorAplicacion';

export type ResultadoDisputa = 'reembolso_cliente' | 'liberar_freelancer';

export interface DatosResolucionDisputa {
  estado: Extract<EstadoDisputa, 'resuelta' | 'rechazada'>;
  resultado?: ResultadoDisputa;
  resolucion: string;
}

/**
 * Caso de uso: el moderador resuelve una disputa y mueve el dinero del escrow.
 * - `reembolso_cliente`: devuelve el pago retenido y cancela el contrato.
 * - `liberar_freelancer`: libera el pago, completa el contrato y genera liquidación.
 * - `rechazada`: cierra la disputa sin mover dinero; el contrato sigue activo.
 */
export class ResolverDisputaUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private disputaRepository: DisputaRepository,
    private notificacionRepository: NotificacionRepository,
    private pagoRepository: PagoRepository,
    private liquidacionRepository: LiquidacionRepository,
    private pasarela: PasarelaPago,
    private comisionFreelancerPorcentaje: number
  ) {}

  async ejecutar(
    disputaId: number,
    adminId: number,
    datos: DatosResolucionDisputa
  ): Promise<Disputa> {
    const disputa = await this.disputaRepository.obtenerPorId(disputaId);
    if (!disputa) {
      throw new ErrorNoEncontrado('Disputa no encontrada');
    }
    if (disputa.estado !== 'abierta' && disputa.estado !== 'en_revision') {
      throw new ErrorConflicto('La disputa ya no está abierta para resolución');
    }

    const contrato = await this.contratoRepository.obtener(disputa.contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato de la disputa no encontrado');
    }

    if (datos.estado === 'resuelta') {
      if (!datos.resultado) {
        throw new ErrorValidacion(
          'Debes indicar si el dinero se reembolsa al cliente o se libera al freelancer'
        );
      }
      await this.moverDinero(disputa, datos.resultado, contrato);
    }

    const actualizada = await this.disputaRepository.resolver(
      disputaId,
      adminId,
      datos.estado,
      datos.resolucion
    );

    const mensaje =
      datos.estado === 'rechazada'
        ? `La disputa fue rechazada: ${datos.resolucion}`
        : `La disputa fue resuelta (${datos.resultado}): ${datos.resolucion}`;

    await Promise.all([
      this.notificacionRepository.crear({
        usuarioId: contrato.cliente.id,
        tipo: 'disputa_resuelta',
        titulo: 'Disputa resuelta',
        mensaje,
        enlace: `/contratos/${disputa.contratoId}`,
      }),
      this.notificacionRepository.crear({
        usuarioId: contrato.freelancer.id,
        tipo: 'disputa_resuelta',
        titulo: 'Disputa resuelta',
        mensaje,
        enlace: `/contratos/${disputa.contratoId}`,
      }),
    ]);

    return actualizada;
  }

  private async moverDinero(
    disputa: Disputa,
    resultado: ResultadoDisputa,
    contrato: Awaited<ReturnType<ContratoRepository['obtener']>>
  ): Promise<void> {
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato de la disputa no encontrado');
    }

    const pago = await this.pagoRepository.obtenerPorContrato(disputa.contratoId);
    if (!pago) {
      throw new ErrorNoEncontrado('Pago del contrato no encontrado');
    }
    if (pago.estado !== 'retenido') {
      throw new ErrorConflicto(
        'El pago del contrato no está retenido; la disputa no puede mover dinero'
      );
    }

    if (resultado === 'reembolso_cliente') {
      if (!this.pasarela.esSimulada && pago.referenciaPasarela) {
        await this.pasarela.reembolsar(pago.referenciaPasarela);
      }
      await this.pagoRepository.reembolsar(disputa.contratoId);
      await this.contratoRepository.cambiarEstado(disputa.contratoId, 'cancelado');
      return;
    }

    await this.pagoRepository.liberar(disputa.contratoId);
    await this.contratoRepository.cambiarEstado(disputa.contratoId, 'completado');

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
  }
}
