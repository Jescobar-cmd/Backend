import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BadRequestError, UnauthorizedError } from '../../../shared/errors/AppError';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError('El id de la oferta no es válido');
  }
  return id;
}

function parsearEnteroPositivo(valor: unknown, nombre: string): number | undefined {
  if (typeof valor !== 'string' || !valor) return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new BadRequestError(`El ${nombre} no es válido`);
  }
  return numero;
}

function parsearTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor ? valor : undefined;
}

export class FeedController {
  /** GET /api/feed?limit=10 */
  static async obtener(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      const rol = req.user?.rol;
      if (!usuarioId || rol === undefined) throw new UnauthorizedError('No autorizado');

      const limite = Math.min(30, Math.max(1, Number(req.query.limit) || 10));
      const feed = await container.obtenerFeed.execute(usuarioId, rol, limite);
      res.json(feed);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/ofertas?page=&limit=&categoriaId=&q= */
  static async ofertasPublicas(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      const resultado = await container.listarOfertasPublicas.execute({
        page,
        limit,
        categoriaId: parsearEnteroPositivo(req.query.categoriaId, 'categoriaId'),
        texto: parsearTexto(req.query.q),
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/ofertas/:id */
  static async ofertaPublica(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const oferta = await container.obtenerOfertaPublica.execute(parsearId(req.params.id));
      res.json(oferta);
    } catch (e) {
      next(e);
    }
  }
}
