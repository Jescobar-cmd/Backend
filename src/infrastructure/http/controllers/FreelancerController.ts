import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  parsearIdParam,
} from '../helpers/peticion.helper';
import { NotificacionController } from './NotificacionController';

export class FreelancerController {
  // Delegación a NotificacionController (DRY y Single Responsibility)
  static notificaciones = NotificacionController.listar;
  static marcarNotificacionLeida = NotificacionController.marcarLeida;
  static marcarTodasLeidas = NotificacionController.marcarTodasLeidas;

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
