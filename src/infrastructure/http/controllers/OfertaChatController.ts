import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BadRequestError, UnauthorizedError } from '../../../shared/errors/AppError';

function parsearId(valor: string, nombre: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(`El id de ${nombre} no es válido`);
  }
  return id;
}

export class OfertaChatController {
  /** POST /api/conversaciones/:id/ofertas */
  static async crear(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const mensaje = await container.crearOfertaChat.execute(
        parsearId(req.params.id, 'la conversación'),
        usuarioId,
        req.body
      );
      res.status(201).json(mensaje);
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/ofertas-chat/:id/aceptar */
  static async aceptar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const contrato = await container.aceptarOfertaChat.execute(
        parsearId(req.params.id, 'la oferta'),
        usuarioId
      );
      res.json({ mensaje: 'Oferta aceptada y contrato creado', contrato });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/ofertas-chat/:id/rechazar */
  static async rechazar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      await container.rechazarOfertaChat.execute(
        parsearId(req.params.id, 'la oferta'),
        usuarioId
      );
      res.json({ mensaje: 'Oferta rechazada' });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/ofertas-chat/:id/contraoferta */
  static async contraofertar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const mensaje = await container.contraofertar.execute(
        parsearId(req.params.id, 'la oferta'),
        usuarioId,
        req.body
      );
      res.status(201).json(mensaje);
    } catch (e) {
      next(e);
    }
  }
}
