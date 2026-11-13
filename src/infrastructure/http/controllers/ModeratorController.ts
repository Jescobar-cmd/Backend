import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { parsearIdParam, parsearPaginacion } from '../helpers/peticion.helper';
import { ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';
import { EstadoDisputa } from '../../../domain/entities/Disputa';
import { EstadoLiquidacion } from '../../../domain/entities/Liquidacion';
import { EstadoReporte } from '../../../domain/entities/Reporte';

export class ModeratorController {
  /** GET /api/moderador/dashboard */
  static async dashboard(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dashboard = await contenedor.obtenerDashboardModerador.ejecutar();
      res.json(dashboard);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/moderador/reportes */
  static async reportes(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit } = parsearPaginacion(req.query, {
        page: 1,
        limit: 20,
        maxLimit: 50,
      });
      const estado = req.query.estado as EstadoReporte | undefined;
      const reportes = await contenedor.listarReportesAdmin.ejecutar({
        ...(estado ? { estado } : {}),
        page,
        limit,
      });
      res.json({ total: reportes.length, reportes });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/moderador/reportes/:id */
  static async reporte(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reporteId = parsearIdParam(req.params.id, 'reporte');
      const reporte = await contenedor.obtenerReporteAdmin.ejecutar(reporteId);
      res.json(reporte);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/moderador/reportes/:id/resolver */
  static async resolverReporte(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.usuario?.id;
      if (!adminId) {
        throw new ErrorNoAutorizado('No autorizado');
      }
      const reporteId = parsearIdParam(req.params.id, 'reporte');
      const reporte = await contenedor.resolverReporteAdmin.ejecutar(
        reporteId,
        adminId,
        req.body.resolucion,
        'resuelto'
      );
      res.json({ reporte });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/moderador/disputas */
  static async disputas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit } = parsearPaginacion(req.query, {
        page: 1,
        limit: 20,
        maxLimit: 50,
      });
      const estado = req.query.estado as EstadoDisputa | undefined;
      const disputas = await contenedor.listarDisputasAdmin.ejecutar({
        ...(estado ? { estado } : {}),
        page,
        limit,
      });
      res.json({ total: disputas.length, disputas });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/moderador/disputas/:id */
  static async disputa(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const disputaId = parsearIdParam(req.params.id, 'disputa');
      const disputa = await contenedor.obtenerDisputaAdmin.ejecutar(disputaId);
      res.json(disputa);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/moderador/disputas/:id/resolver */
  static async resolverDisputa(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.usuario?.id;
      if (!adminId) {
        throw new ErrorNoAutorizado('No autorizado');
      }
      const disputaId = parsearIdParam(req.params.id, 'disputa');
      const disputa = await contenedor.resolverDisputaAdmin.ejecutar(
        disputaId,
        adminId,
        req.body.estado,
        req.body.resolucion
      );
      res.json({ disputa });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/moderador/liquidaciones */
  static async liquidaciones(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit } = parsearPaginacion(req.query, {
        page: 1,
        limit: 20,
        maxLimit: 50,
      });
      const estado = req.query.estado as EstadoLiquidacion | undefined;
      const liquidaciones = await contenedor.listarLiquidacionesAdmin.ejecutar({
        ...(estado ? { estado } : {}),
        page,
        limit,
      });
      res.json({ total: liquidaciones.length, liquidaciones });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/moderador/liquidaciones/:id/pagar */
  static async aprobarRetiro(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.usuario?.id;
      if (!adminId) {
        throw new ErrorNoAutorizado('No autorizado');
      }
      const liquidacionId = parsearIdParam(req.params.id, 'liquidaci@QF3n');
      const liquidacion = await contenedor.aprobarRetiroAdmin.ejecutar(
        liquidacionId,
        adminId,
        'pagada',
        req.body.referencia ?? null
      );
      res.json({ liquidacion });
    } catch (e) {
      next(e);
    }
  }
}

