import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BadRequestError, UnauthorizedError } from '../../../shared/errors/AppError';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError('El id de la publicación no es válido');
  }
  return id;
}

export class PublicacionController {
  /** POST /api/publicaciones */
  static async crear(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');
      const publicacion = await container.crearPublicacion.execute(usuarioId, req.body);
      res.status(201).json({ mensaje: 'Publicación creada correctamente', publicacion });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/publicaciones?page=&limit=&autorId= */
  static async listar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      let autorId: number | undefined;
      const rawAutorId = req.query.autorId;
      if (typeof rawAutorId === 'string' && rawAutorId) {
        const numero = Number(rawAutorId);
        if (!Number.isInteger(numero) || numero <= 0) {
          throw new BadRequestError('El autorId no es válido');
        }
        autorId = numero;
      }

      const resultado = await container.listarPublicaciones.execute(usuarioId, {
        page,
        limit,
        autorId,
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/publicaciones/:id */
  static async detalle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');
      const publicacion = await container.obtenerPublicacion.execute(
        parsearId(req.params.id),
        usuarioId
      );
      res.json(publicacion);
    } catch (e) {
      next(e);
    }
  }

  /** DELETE /api/publicaciones/:id (borrado lógico) */
  static async eliminar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      const rol = req.user?.rol;
      if (!usuarioId || rol === undefined) throw new UnauthorizedError('No autorizado');
      await container.eliminarPublicacion.execute(parsearId(req.params.id), usuarioId, rol);
      res.json({ mensaje: 'Publicación eliminada correctamente' });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/publicaciones/:id/like (toggle) */
  static async alternarMeGusta(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');
      const resultado = await container.alternarMeGusta.execute(
        parsearId(req.params.id),
        usuarioId
      );
      res.json({
        mensaje: resultado.meGusta ? 'Me gusta agregado' : 'Me gusta eliminado',
        ...resultado,
      });
    } catch (e) {
      next(e);
    }
  }
}
