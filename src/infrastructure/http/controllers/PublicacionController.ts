import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  obtenerUsuarioSesion,
  parsearIdParam,
  parsearPaginacion,
  parsearEnteroOpcional,
} from '../helpers/peticion.helper';

export class PublicacionController {
  /** POST /api/publicaciones */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const publicacion = await contenedor.crearPublicacion.ejecutar(usuarioId, req.body);
      res.status(201).json({ mensaje: 'Publicación creada correctamente', publicacion });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/publicaciones?page=&limit=&autorId= */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const { page, limit } = parsearPaginacion(req.query, { page: 1, limit: 10, maxLimit: 50 });
      const autorId = parsearEnteroOpcional(req.query.autorId, 'autorId');

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
      const usuarioId = obtenerUsuarioId(req);
      const publicacionId = parsearIdParam(req.params.id, 'publicación');
      const publicacion = await contenedor.obtenerPublicacion.ejecutar(
        publicacionId,
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
      const { id: usuarioId, rol } = obtenerUsuarioSesion(req);
      const publicacionId = parsearIdParam(req.params.id, 'publicación');
      await contenedor.eliminarPublicacion.ejecutar(publicacionId, usuarioId, rol);
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
      const usuarioId = obtenerUsuarioId(req);
      const publicacionId = parsearIdParam(req.params.id, 'publicación');
      const resultado = await contenedor.alternarMeGusta.ejecutar(
        publicacionId,
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
