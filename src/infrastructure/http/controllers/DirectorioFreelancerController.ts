import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ConsultaDirectorio } from '../../../application/validators/directorio.schemas';

export class DirectorioFreelancerController {
  /** GET /api/freelancers?page=&limit=&q=&habilidadId=&categoriaId= */
  static async listar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, q, habilidadId, categoriaId } = (req.query as unknown as ConsultaDirectorio) ?? {};

      const resultado = await contenedor.buscarFreelancers.ejecutar({
        page: page ?? 1,
        limit: limit ?? 12,
        texto: q,
        habilidadId,
        categoriaId,
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }
}
