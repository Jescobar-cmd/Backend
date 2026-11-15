import { ContratoRepository } from '../../domain/ports/repositories/ContratoRepository';
import { DisputaRepository } from '../../domain/ports/repositories/DisputaRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { ReporteRepository } from '../../domain/ports/repositories/ReporteRepository';
import { Disputa } from '../../domain/entities/Disputa';
import { Reporte } from '../../domain/entities/Reporte';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorValidacion,
} from '../../shared/errors/ErrorAplicacion';

export interface ResultadoDerivarDisputa {
  reporte: Reporte;
  disputa: Disputa;
}

/**
 * Caso de uso: un moderador deriva un reporte pendiente a disputa formal.
 *
 * Requiere que el reporte apunte a un proyecto con contrato activo;
 * la disputa se abre sobre ese contrato para gestionar el dinero
 * desde el módulo de disputas.
 */
export class DerivarReporteADisputaUseCase {
  constructor(
    private reporteRepository: ReporteRepository,
    private contratoRepository: ContratoRepository,
    private disputaRepository: DisputaRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    reporteId: number,
    moderadorId: number,
    descripcion?: string
  ): Promise<ResultadoDerivarDisputa> {
    const reporte = await this.reporteRepository.obtenerPorId(reporteId);
    if (!reporte) {
      throw new ErrorNoEncontrado('Reporte no encontrado');
    }
    if (reporte.estado !== 'pendiente') {
      throw new ErrorConflicto('El reporte no está pendiente');
    }
    if (!reporte.proyectoId) {
      throw new ErrorValidacion('El reporte no está asociado a un proyecto');
    }

    const contratos = await this.contratoRepository.listarPorPublicacion(
      'proyecto',
      reporte.proyectoId,
      ['activo']
    );
    const contrato = contratos[0];
    if (!contrato) {
      throw new ErrorConflicto('No existe contrato activo para el proyecto');
    }
    if (await this.disputaRepository.existeAbierta(contrato.id)) {
      throw new ErrorConflicto('Ya existe una disputa abierta para ese contrato');
    }

    const disputa = await this.disputaRepository.crear({
      contratoId: contrato.id,
      abiertaPorId: moderadorId,
      motivo: reporte.motivo,
      descripcion:
        descripcion?.trim() ||
        reporte.descripcion ||
        `Derivado del reporte #${reporte.id}: ${reporte.motivo}`,
    });

    // Las partes del contrato deben saber que su dinero quedó en disputa.
    const participantes = [contrato.cliente.id, contrato.freelancer.id];
    await Promise.all(
      participantes.map((usuarioId) =>
        this.notificacionRepository.crear({
          usuarioId,
          tipo: 'disputa_abierta',
          titulo: 'Disputa abierta',
          mensaje: `Se abrió una disputa en el contrato #${contrato.id} por: ${reporte.motivo}.`,
          enlace: `/contratos/${contrato.id}`,
        })
      )
    );

    return { reporte, disputa };
  }
}
