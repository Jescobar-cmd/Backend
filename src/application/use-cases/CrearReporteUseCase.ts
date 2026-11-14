import { Reporte } from '../../domain/entities/Reporte';
import { ReporteRepository } from '../../domain/ports/repositories/ReporteRepository';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { ROLES } from '../../shared/constants/roles';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorValidacion,
} from '../../shared/errors/ErrorAplicacion';

export interface DatosCrearReporte {
  usuarioReportaId: number;
  usuarioReportadoId?: number | null;
  proyectoId?: number | null;
  motivo: string;
  descripcion?: string | null;
}

/** Caso de uso: cualquier usuario autenticado reporta a otro usuario o un proyecto. */
export class CrearReporteUseCase {
  constructor(
    private reporteRepository: ReporteRepository,
    private notificacionRepository: NotificacionRepository,
    private usuarioRepository: RepositorioUsuario
  ) {}

  async ejecutar(datos: DatosCrearReporte): Promise<Reporte> {
    const usuarioReportadoId = datos.usuarioReportadoId ?? null;
    const proyectoId = datos.proyectoId ?? null;

    if (!usuarioReportadoId && !proyectoId) {
      throw new ErrorValidacion(
        'Debes indicar el usuario o el proyecto que quieres reportar'
      );
    }

    if (usuarioReportadoId === datos.usuarioReportaId) {
      throw new ErrorConflicto('No puedes reportarte a ti mismo');
    }

    if (usuarioReportadoId) {
      const reportado = await this.usuarioRepository.buscarPorId(usuarioReportadoId);
      if (!reportado) {
        throw new ErrorNoEncontrado('El usuario reportado no existe');
      }
    }

    const reporte = await this.reporteRepository.crear({
      usuarioReportaId: datos.usuarioReportaId,
      usuarioReportadoId,
      proyectoId,
      adminId: null,
      motivo: datos.motivo.trim(),
      descripcion: datos.descripcion?.trim() || null,
      estado: 'pendiente',
    });

    await this.notificarModeradores(reporte);

    return reporte;
  }

  private async notificarModeradores(reporte: Reporte): Promise<void> {
    const moderadores = await this.usuarioRepository.listarIdsPorRoles([
      ROLES.ADMIN,
      ROLES.MODERADOR,
    ]);

    await Promise.all(
      moderadores.map((usuarioId) =>
        this.notificacionRepository.crear({
          usuarioId,
          tipo: 'reporte_creado',
          titulo: 'Nuevo reporte pendiente',
          mensaje: `Se recibió un reporte por "${reporte.motivo}". Revísalo en el panel de moderación.`,
          enlace: `/api/moderador/reportes/${reporte.id}`,
        })
      )
    );
  }
}
