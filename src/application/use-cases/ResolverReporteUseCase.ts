import { EstadoReporte, Reporte } from '../../domain/entities/Reporte';
import { ReporteRepository } from '../../domain/ports/repositories/ReporteRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { ErrorConflicto, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export class ResolverReporteUseCase {
  constructor(
    private reporteRepository: ReporteRepository,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(
    id: number,
    adminId: number,
    resolucion: string,
    estado: EstadoReporte = 'resuelto'
  ): Promise<Reporte> {
    const reporte = await this.reporteRepository.obtenerPorId(id);
    if (!reporte) {
      throw new ErrorNoEncontrado('Reporte no encontrado');
    }
    if (reporte.estado !== 'pendiente') {
      throw new ErrorConflicto('El reporte ya fue gestionado');
    }

    const actualizada = await this.reporteRepository.resolver(
      id,
      adminId,
      resolucion,
      estado
    );

    const veredicto = estado === 'rechazado' ? 'desestimado' : 'resuelto';

    // El usuario reportado recibe el aviso de la decisión.
    if (reporte.usuarioReportadoId) {
      await this.notificacionRepository.crear({
        usuarioId: reporte.usuarioReportadoId,
        tipo: 'reporte_resuelto',
        titulo: 'Reporte resuelto',
        mensaje: `La plataforma revisó un reporte sobre tu cuenta y lo dejó ${veredicto}: ${resolucion}`,
        enlace: `/notificaciones`,
      });
    }

    // El usuario que reportó también recibe la resolución.
    if (
      reporte.usuarioReportaId !== reporte.usuarioReportadoId
    ) {
      await this.notificacionRepository.crear({
        usuarioId: reporte.usuarioReportaId,
        tipo: 'reporte_resuelto',
        titulo: 'Tu reporte fue atendido',
        mensaje: `Tu reporte fue ${veredicto} por la plataforma: ${resolucion}`,
        enlace: `/notificaciones`,
      });
    }

    return actualizada;
  }
}
