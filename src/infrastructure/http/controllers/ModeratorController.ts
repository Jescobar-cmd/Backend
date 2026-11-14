import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { NotificacionController } from './NotificacionController';
import {
  obtenerUsuarioId,
  parsearIdParam,
  parsearPaginacion,
} from '../helpers/peticion.helper';
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
      res.json(reportes);
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
        req.body.estado
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
      res.json(disputas);
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

  /** PATCH /api/moderador/disputas/:id/revision */
  static async marcarDisputaEnRevision(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = obtenerUsuarioId(req);
      const disputaId = parsearIdParam(req.params.id, 'disputa');
      const disputa = await contenedor.marcarDisputaEnRevision.ejecutar(
        disputaId,
        adminId
      );
      res.json({ disputa });
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
      const adminId = obtenerUsuarioId(req);
      const disputaId = parsearIdParam(req.params.id, 'disputa');
      const disputa = await contenedor.resolverDisputaAdmin.ejecutar(
        disputaId,
        adminId,
        {
          estado: req.body.estado,
          ...(req.body.resultado ? { resultado: req.body.resultado } : {}),
          resolucion: req.body.resolucion,
        }
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
      res.json(liquidaciones);
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
      const liquidacionId = parsearIdParam(req.params.id, 'liquidación');
      const liquidacion = await contenedor.aprobarRetiroAdmin.ejecutar(
        liquidacionId,
        adminId,
        req.body.estado,
        req.body.referencia ?? null,
        req.body.motivoRechazo ?? null
      );
      res.json({ liquidacion });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/moderador/usuarios/:id/suspender */
  static async suspenderUsuario(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const moderadorId = obtenerUsuarioId(req);
      const usuarioId = parsearIdParam(req.params.id, 'usuario');
      const usuario = await contenedor.suspenderUsuario.ejecutar(
        usuarioId,
        moderadorId,
        req.body.motivo
      );
      res.json({
        mensaje: 'Cuenta suspendida correctamente',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          estado: usuario.estado,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/moderador/usuarios/:id/reactivar */
  static async reactivarUsuario(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = parsearIdParam(req.params.id, 'usuario');
      const usuario = await contenedor.reactivarUsuario.ejecutar(usuarioId);
      res.json({
        mensaje: 'Cuenta reactivada correctamente',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          estado: usuario.estado,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/moderador/notificaciones */
  static async notificaciones(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    return NotificacionController.listar(req, res, next);
  }

  /** PATCH /api/moderador/notificaciones/leidas */
  static async marcarNotificacionesLeidas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    return NotificacionController.marcarTodasLeidas(req, res, next);
  }

  /** PATCH /api/moderador/notificaciones/:id/leida */
  static async marcarNotificacionLeida(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    return NotificacionController.marcarLeida(req, res, next);
  }
}

