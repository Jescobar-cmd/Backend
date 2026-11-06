import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId } from '../helpers/peticion.helper';
import { ConsultaEstadisticas } from '../../../application/validators/estadistica.schemas';

export class EstadisticaController {
  /** GET /api/freelancer/estadisticas?desde=&hasta= */
  static async misEstadisticas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const { desde, hasta } = (req.query as unknown as ConsultaEstadisticas) ?? {};

      const resumen = await contenedor.obtenerEstadisticasFreelancer.ejecutar(
        freelancerId,
        desde,
        hasta
      );
      res.json(resumen);
    } catch (e) {
      next(e);
    }
  }
}
