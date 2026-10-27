import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BadRequestError, UnauthorizedError } from '../../../shared/errors/AppError';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError('El id de la conversación no es válido');
  }
  return id;
}

function parsearAfterId(valor: unknown): number | undefined {
  if (typeof valor !== 'string' || !valor) return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new BadRequestError('El afterId no es válido');
  }
  return numero;
}

export class ConversacionController {
  /** POST /api/conversaciones */
  static async crear(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      const rol = req.user?.rol;
      if (!usuarioId || rol === undefined) throw new UnauthorizedError('No autorizado');

      const conversacion = await container.crearConversacion.execute(usuarioId, rol, req.body);
      res.status(201).json({ mensaje: 'Conversación disponible', conversacion });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/conversaciones */
  static async listar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const conversaciones = await container.listarConversaciones.execute(usuarioId);
      res.json({ total: conversaciones.length, conversaciones });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/conversaciones/:id */
  static async detalle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const conversacion = await container.obtenerConversacion.execute(
        parsearId(req.params.id),
        usuarioId
      );
      res.json(conversacion);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/conversaciones/:id/mensajes?afterId=&limit= */
  static async mensajes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
      const resultado = await container.listarMensajes.execute(
        parsearId(req.params.id),
        usuarioId,
        parsearAfterId(req.query.afterId),
        limit
      );
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/conversaciones/:id/mensajes */
  static async enviar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const nuevo = await container.enviarMensaje.execute(
        parsearId(req.params.id),
        usuarioId,
        req.body.contenido
      );
      res.status(201).json(nuevo);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/conversaciones/:id/leido */
  static async marcarLeido(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const resultado = await container.marcarConversacionLeida.execute(
        parsearId(req.params.id),
        usuarioId
      );
      res.json({ mensaje: 'Conversación marcada como leída', ...resultado });
    } catch (e) {
      next(e);
    }
  }
}
