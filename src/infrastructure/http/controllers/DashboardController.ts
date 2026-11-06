import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId } from '../helpers/peticion.helper';

export class DashboardController {
  /** GET /api/freelancer/dashboard */
  static async obtener(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const dashboard = await contenedor.obtenerDashboardFreelancer.ejecutar(freelancerId);
      res.json(dashboard);
    } catch (e) {
      next(e);
    }
  }
}
