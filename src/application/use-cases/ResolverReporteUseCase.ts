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

    let notificacionEnviada = false;
    if (reporte.usuarioReportadoId) {
      await this.notificacionRepository.crear({
        usuarioId: reporte.usuarioReportadoId,
        tipo: 'reporte_resuelto',
        titulo: 'Reporte resuelto',
        mensaje: `Tu reporte fue resuelto por la plataforma: ${resolucion}`,
        enlace: `/api/moderador/reportes/${id}`,
      });
      notificacionEnviada = true;
    }

    return actualizada;
  }
}
