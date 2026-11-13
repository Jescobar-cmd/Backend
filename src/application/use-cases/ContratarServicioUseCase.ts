import { aContratoVista, ContratoVista } from '../../domain/entities/Contrato';
import { calcularMontoCliente } from '../../domain/entities/Liquidacion';
import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { ServicioRepository } from '../../domain/ports/repositories/ServicioRepository';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el cliente contrata directamente un servicio publicado. */
export class ContratarServicioUseCase {
  constructor(
    private servicioRepository: ServicioRepository,
    private contratoRepository: ContratoRepository,
    private notificacionRepository: NotificacionRepository,
    private comisionClientePorcentaje: number
  ) {}

  async ejecutar(clienteId: number, servicioId: number): Promise<ContratoVista> {
    const servicio = await this.servicioRepository.obtenerPorId(servicioId);
    if (!servicio) {
      throw new ErrorNoEncontrado('Servicio no encontrado');
    }
    if (servicio.estado !== 'activo') {
      throw new ErrorConflicto('El servicio no está disponible');
    }
    if (servicio.freelancer.id === clienteId) {
      throw new ErrorConflicto('No puedes contratar tu propio servicio');
    }
    if (await this.contratoRepository.existeActivoPorServicio(clienteId, servicioId)) {
      throw new ErrorConflicto('Ya tienes un contrato activo para este servicio');
    }

    const montoPagoCliente = calcularMontoCliente(
      servicio.precio,
      this.comisionClientePorcentaje
    );
    const contrato = await this.contratoRepository.crearCompraDirecta(
      clienteId,
      servicioId,
      montoPagoCliente
    );

    await this.notificacionRepository.crear({
      usuarioId: servicio.freelancer.id,
      tipo: 'contrato_creado',
      titulo: 'Nuevo contrato',
      mensaje: `Un cliente contrató tu servicio "${servicio.titulo}".`,
      enlace: `/contratos/${contrato.id}`,
    });

    return aContratoVista(contrato, clienteId);
  }
}
