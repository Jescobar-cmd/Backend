import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  parsearIdParam,
  parsearPaginacion,
} from '../helpers/peticion.helper';

export class NotificacionController {
  /** GET /api/.../notificaciones?page=&limit=&soloNoLeidas= */
  static async listar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const { page, limit } = parsearPaginacion(req.query, {
        page: 1,
        limit: 20,
        maxLimit: 50,
      });
      const resultado = await contenedor.listarNotificaciones.ejecutar(usuarioId, {
        page,
        limit,
        soloNoLeidas: String(req.query.soloNoLeidas) === 'true',
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/.../notificaciones/:id/leida */
  static async marcarLeida(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const notificacionId = parsearIdParam(req.params.id, 'notificación');
      const notificacion = await contenedor.marcarNotificacionLeida.ejecutar(
        notificacionId,
        usuarioId
      );
      res.json({ mensaje: 'Notificación marcada como leída', notificacion });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/.../notificaciones/leidas */
  static async marcarTodasLeidas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const resultado = await contenedor.marcarTodasNotificacionesLeidas.ejecutar(
        usuarioId
      );
      res.json({
        mensaje: 'Notificaciones marcadas como leídas',
        actualizadas: resultado.actualizadas,
      });
    } catch (e) {
      next(e);
    }
  }
}
