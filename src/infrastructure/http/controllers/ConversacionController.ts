import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  obtenerUsuarioSesion,
  parsearIdParam,
  parsearEnteroOpcional,
} from '../helpers/peticion.helper';

export class ConversacionController {
  /** POST /api/conversaciones */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: usuarioId, rol } = obtenerUsuarioSesion(req);
      const conversacion = await contenedor.crearConversacion.ejecutar(usuarioId, rol, req.body);
      res.status(201).json({ mensaje: 'Conversación disponible', conversacion });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/conversaciones */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const conversaciones = await contenedor.listarConversaciones.ejecutar(usuarioId);
      res.json({ total: conversaciones.length, conversaciones });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/conversaciones/:id */
  static async detalle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const conversacionId = parsearIdParam(req.params.id, 'conversación');
      const conversacion = await contenedor.obtenerConversacion.ejecutar(
        conversacionId,
        usuarioId
      );
      res.json(conversacion);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/conversaciones/:id/mensajes?afterId=&limit= */
  static async mensajes(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const conversacionId = parsearIdParam(req.params.id, 'conversación');
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
      const afterId = parsearEnteroOpcional(req.query.afterId, 'afterId');

      const resultado = await contenedor.listarMensajes.ejecutar(
        conversacionId,
        usuarioId,
        afterId,
        limit
      );
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/conversaciones/:id/mensajes */
  static async enviar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const conversacionId = parsearIdParam(req.params.id, 'conversación');
      const nuevo = await contenedor.enviarMensaje.ejecutar(
        conversacionId,
        usuarioId,
        req.body.contenido
      );
      res.status(201).json(nuevo);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/conversaciones/:id/leido */
  static async marcarLeido(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const conversacionId = parsearIdParam(req.params.id, 'conversación');
      const resultado = await contenedor.marcarConversacionLeida.ejecutar(
        conversacionId,
        usuarioId
      );
      res.json({ mensaje: 'Conversación marcada como leída', ...resultado });
    } catch (e) {
      next(e);
    }
  }
}
