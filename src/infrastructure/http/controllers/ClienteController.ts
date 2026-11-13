import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  parsearIdParam,
  parsearPaginacion,
} from '../helpers/peticion.helper';

export class ClienteController {
  /** GET /api/cliente/dashboard */
  static async dashboard(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const dashboard = await contenedor.obtenerDashboardCliente.ejecutar(clienteId);
      res.json(dashboard);
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/cliente/servicios/:id/contratar */
  static async contratarServicio(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const servicioId = parsearIdParam(req.params.id, 'servicio');
      const contrato = await contenedor.contratarServicio.ejecutar(
        clienteId,
        servicioId
      );
      res.status(201).json({
        mensaje: 'Servicio contratado correctamente. El pago quedó pendiente.',
        contrato,
      });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/cliente/pagos */
  static async pagos(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const pagos = await contenedor.listarPagosCliente.ejecutar(clienteId);
      res.json({ total: pagos.length, pagos });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/cliente/pagos/:id/factura */
  static async factura(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const pagoId = parsearIdParam(req.params.id, 'pago');
      const factura = await contenedor.obtenerFacturaPago.ejecutar(pagoId, clienteId);
      res.json(factura);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/cliente/notificaciones?page=&limit=&soloNoLeidas= */
  static async notificaciones(
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
        soloNoLeidas: req.query.soloNoLeidas === 'true',
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/cliente/notificaciones/:id/leida */
  static async marcarNotificacionLeida(
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

  /** PATCH /api/cliente/notificaciones/leidas */
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
