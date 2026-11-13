import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  parsearIdParam,
} from '../helpers/peticion.helper';
import { NotificacionController } from './NotificacionController';

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

  // Delegación a NotificacionController (DRY y Single Responsibility)
  static notificaciones = NotificacionController.listar;
  static marcarNotificacionLeida = NotificacionController.marcarLeida;
  static marcarTodasLeidas = NotificacionController.marcarTodasLeidas;
}
