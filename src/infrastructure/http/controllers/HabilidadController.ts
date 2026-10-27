import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';

export class HabilidadController {
  /** GET /api/habilidades */
  static async listar(
    _req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habilidades = await contenedor.listarHabilidades.ejecutar();
      res.json({ total: habilidades.length, habilidades });
    } catch (e) {
      next(e);
    }
  }
}
