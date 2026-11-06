import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioSesion,
  parsearIdParam,
  parsearPaginacion,
  parsearEnteroOpcional,
} from '../helpers/peticion.helper';

function parsearTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : undefined;
}

export class FeedController {
  /** GET /api/feed?limit=10 */
  static async obtener(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: usuarioId, rol } = obtenerUsuarioSesion(req);
      const limite = Math.min(30, Math.max(1, Number(req.query.limit) || 10));
      const feed = await contenedor.obtenerFeed.ejecutar(usuarioId, rol, limite);
      res.json(feed);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/ofertas?page=&limit=&categoriaId=&q= */
  static async ofertasPublicas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit } = parsearPaginacion(req.query, { page: 1, limit: 10, maxLimit: 50 });

      const resultado = await contenedor.listarOfertasPublicas.ejecutar({
        page,
        limit,
        categoriaId: parsearEnteroOpcional(req.query.categoriaId, 'categoriaId'),
        texto: parsearTexto(req.query.q),
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/ofertas/:id */
  static async ofertaPublica(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const ofertaId = parsearIdParam(req.params.id, 'oferta');
      const oferta = await contenedor.obtenerOfertaPublica.ejecutar(ofertaId);
      res.json(oferta);
    } catch (e) {
      next(e);
    }
  }
}
