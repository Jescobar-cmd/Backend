import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorSolicitudInvalida('El id de la oferta no es válido');
  }
  return id;
}

function parsearEnteroPositivo(valor: unknown, nombre: string): number | undefined {
  if (typeof valor !== 'string' || !valor) return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorSolicitudInvalida(`El ${nombre} no es válido`);
  }
  return numero;
}

function parsearTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor ? valor : undefined;
}

export class FeedController {
  /** GET /api/feed?limit=10 */
  static async obtener(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      const rol = req.usuario?.rol;
      if (!usuarioId || rol === undefined) throw new ErrorNoAutorizado('No autorizado');

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
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      const resultado = await contenedor.listarOfertasPublicas.ejecutar({
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
  static async ofertaPublica(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const oferta = await contenedor.obtenerOfertaPublica.ejecutar(parsearId(req.params.id));
      res.json(oferta);
    } catch (e) {
      next(e);
    }
  }
}
