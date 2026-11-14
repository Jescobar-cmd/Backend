import { aContratoVista, ContratoVista } from '../../domain/entities/Contrato';
import { calcularMontoCliente } from '../../domain/entities/Liquidacion';
import { PropuestaRepository } from '../../domain/ports/repositories/PropuestaRepository';
import {
  ErrorConflicto,
  ErrorProhibido,
  ErrorNoEncontrado,
} from '../../shared/errors/ErrorAplicacion';

/**
 * Caso de uso: el cliente acepta una propuesta.
 * El adaptador cierra las demás propuestas, pasa la oferta a 'en_progreso'
 * y crea el contrato + pago pendiente en una sola transacción.
 * El contrato nace en `pendiente_pago` hasta que Mercado Pago confirme.
 */
export class AceptarPropuestaUseCase {
  constructor(
    private propuestaRepository: PropuestaRepository,
    private comisionClientePorcentaje: number
  ) {}

  async ejecutar(
    clienteId: number,
    ofertaId: number,
    propuestaId: number
  ): Promise<ContratoVista> {
    const detalle = await this.propuestaRepository.obtenerDetalle(propuestaId);
    if (!detalle || detalle.proyectoId !== ofertaId) {
      throw new ErrorNoEncontrado('Propuesta no encontrada');
    }
    if (detalle.clienteId !== clienteId) {
      throw new ErrorProhibido('La oferta no te pertenece');
    }
    if (detalle.estado !== 'pendiente') {
      throw new ErrorConflicto('La propuesta ya fue procesada');
    }
    if (detalle.proyectoEstado !== 'abierto') {
      throw new ErrorConflicto('La oferta no está abierta');
    }

    const montoPagoCliente = calcularMontoCliente(
      detalle.montoPropuesto,
      this.comisionClientePorcentaje
    );
    const contrato = await this.propuestaRepository.aceptar(
      propuestaId,
      montoPagoCliente
    );
    return aContratoVista(contrato, clienteId);
  }
}
