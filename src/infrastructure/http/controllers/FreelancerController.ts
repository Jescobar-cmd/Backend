import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  parsearIdParam,
  parsearPaginacion,
} from '../helpers/peticion.helper';

export class FreelancerController {
  /** GET /api/freelancer/notificaciones?page=&limit=&soloNoLeidas= */
  static async notificaciones(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const { page, limit } = parsearPaginacion(req.query, {
        page: 1,
        limit: 20,
        maxLimit: 50,
      });
      const resultado = await contenedor.listarNotificaciones.ejecutar(freelancerId, {
        page,
        limit,
        soloNoLeidas: req.query.soloNoLeidas === 'true',
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/freelancer/notificaciones/:id/leida */
  static async marcarNotificacionLeida(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const notificacionId = parsearIdParam(req.params.id, 'notificación');
      const notificacion = await contenedor.marcarNotificacionLeida.ejecutar(
        notificacionId,
        freelancerId
      );
      res.json({ mensaje: 'Notificación marcada como leída', notificacion });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/freelancer/notificaciones/leidas */
  static async marcarTodasLeidas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const resultado = await contenedor.marcarTodasNotificacionesLeidas.ejecutar(
        freelancerId
      );
      res.json({
        mensaje: 'Notificaciones marcadas como leídas',
        actualizadas: resultado.actualizadas,
      });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/pagos */
  static async pagos(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const pagos = await contenedor.listarPagosFreelancer.ejecutar(freelancerId);
      res.json({ total: pagos.length, pagos });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/pagos/:id/factura */
  static async factura(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const pagoId = parsearIdParam(req.params.id, 'pago');
      const factura = await contenedor.obtenerFacturaPagoFreelancer.ejecutar(
        pagoId,
        freelancerId
      );
      res.json(factura);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/liquidaciones */
  static async liquidaciones(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const resultado = await contenedor.obtenerLiquidacionesFreelancer.ejecutar(
        freelancerId
      );
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/freelancer/liquidaciones/solicitar */
  static async solicitarRetiro(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const resultado = await contenedor.solicitarRetiro.ejecutar(freelancerId);
      res.status(201).json({
        mensaje: 'Solicitud de retiro registrada correctamente',
        ...resultado,
      });
    } catch (e) {
      next(e);
    }
  }
}
