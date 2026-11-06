import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

export class DashboardController {
  /** GET /api/freelancer/dashboard */
  static async obtener(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = req.usuario?.id;
      if (!freelancerId) throw new ErrorNoAutorizado('No autorizado');

      const dashboard = await contenedor.obtenerDashboardFreelancer.ejecutar(freelancerId);
      res.json(dashboard);
    } catch (e) {
      next(e);
    }
  }
}
