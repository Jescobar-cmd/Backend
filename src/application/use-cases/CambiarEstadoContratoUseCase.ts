import {
  aContratoVista,
  ContratoVista,
  EstadoContratoFinal,
} from '../../domain/entities/Contrato';
import { calcularLiquidacion } from '../../domain/entities/Liquidacion';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { LiquidacionRepository } from '../../domain/ports/repositories/LiquidacionRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: un participante cierra el contrato como completado o cancelado. */
export class CambiarEstadoContratoUseCase {
  constructor(
    private contratoRepository: ContratoRepository,
    private liquidacionRepository: LiquidacionRepository,
    private comisionFreelancerPorcentaje: number
  ) {}

  async ejecutar(
    contratoId: number,
    usuarioId: number,
    estado: EstadoContratoFinal
  ): Promise<ContratoVista> {
    const contrato = await this.contratoRepository.obtener(contratoId);
    if (!contrato) {
      throw new ErrorNoEncontrado('Contrato no encontrado');
    }
    if (contrato.cliente.id !== usuarioId && contrato.freelancer.id !== usuarioId) {
      throw new ErrorProhibido('No participas en este contrato');
    }
    if (contrato.estado !== 'activo') {
      throw new ErrorConflicto('El contrato ya no está activo');
    }

    const actualizado = await this.contratoRepository.cambiarEstado(contratoId, estado);

    if (estado === 'completado') {
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

    return aContratoVista(actualizado, usuarioId);
  }
}
