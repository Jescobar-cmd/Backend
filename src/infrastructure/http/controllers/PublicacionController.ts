import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorSolicitudInvalida('El id de la publicación no es válido');
  }
  return id;
}

export class PublicacionController {
  /** POST /api/publicaciones */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');
      const publicacion = await contenedor.crearPublicacion.ejecutar(usuarioId, req.body);
      res.status(201).json({ mensaje: 'Publicación creada correctamente', publicacion });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/publicaciones?page=&limit=&autorId= */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      let autorId: number | undefined;
      const rawAutorId = req.query.autorId;
      if (typeof rawAutorId === 'string' && rawAutorId) {
        const numero = Number(rawAutorId);
        if (!Number.isInteger(numero) || numero <= 0) {
          throw new ErrorSolicitudInvalida('El autorId no es válido');
        }
        autorId = numero;
      }

      const resultado = await contenedor.listarPublicaciones.ejecutar(usuarioId, {
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
  static async detalle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');
      const publicacion = await contenedor.obtenerPublicacion.ejecutar(
        parsearId(req.params.id),
        usuarioId
      );
      res.json(publicacion);
    } catch (e) {
      next(e);
    }
  }

  /** DELETE /api/publicaciones/:id (borrado lógico) */
  static async eliminar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      const rol = req.usuario?.rol;
      if (!usuarioId || rol === undefined) throw new ErrorNoAutorizado('No autorizado');
      await contenedor.eliminarPublicacion.ejecutar(parsearId(req.params.id), usuarioId, rol);
      res.json({ mensaje: 'Publicación eliminada correctamente' });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/publicaciones/:id/like (toggle) */
  static async alternarMeGusta(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');
      const resultado = await contenedor.alternarMeGusta.ejecutar(
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
