import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorSolicitudInvalida('El id de la conversación no es válido');
  }
  return id;
}

function parsearAfterId(valor: unknown): number | undefined {
  if (typeof valor !== 'string' || !valor) return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorSolicitudInvalida('El afterId no es válido');
  }
  return numero;
}

export class ConversacionController {
  /** POST /api/conversaciones */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      const rol = req.usuario?.rol;
      if (!usuarioId || rol === undefined) throw new ErrorNoAutorizado('No autorizado');

      const conversacion = await contenedor.crearConversacion.ejecutar(usuarioId, rol, req.body);
      res.status(201).json({ mensaje: 'Conversación disponible', conversacion });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/conversaciones */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const conversaciones = await contenedor.listarConversaciones.ejecutar(usuarioId);
      res.json({ total: conversaciones.length, conversaciones });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/conversaciones/:id */
  static async detalle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const conversacion = await contenedor.obtenerConversacion.ejecutar(
        parsearId(req.params.id),
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
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
      const resultado = await contenedor.listarMensajes.ejecutar(
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
  static async enviar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const nuevo = await contenedor.enviarMensaje.ejecutar(
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
  static async marcarLeido(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const resultado = await contenedor.marcarConversacionLeida.ejecutar(
        parsearId(req.params.id),
        usuarioId
      );
      res.json({ mensaje: 'Conversación marcada como leída', ...resultado });
    } catch (e) {
      next(e);
    }
  }
}
