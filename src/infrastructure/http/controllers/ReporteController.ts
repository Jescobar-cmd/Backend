import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId } from '../helpers/peticion.helper';

export class ReporteController {
  /** POST /api/reportes */
  static async crear(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const reporte = await contenedor.crearReporte.ejecutar({
        usuarioReportaId: usuarioId,
        usuarioReportadoId: req.body.usuarioReportadoId ?? null,
        proyectoId: req.body.proyectoId ?? null,
        motivo: req.body.motivo,
        descripcion: req.body.descripcion ?? null,
      });

      res.status(201).json({
        mensaje: 'Reporte creado correctamente',
        reporte,
      });
    } catch (e) {
      next(e);
    }
  }
}
