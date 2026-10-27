import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

function parsearId(valor: string, nombre: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorSolicitudInvalida(`El id de ${nombre} no es válido`);
  }
  return id;
}

export class OfertaChatController {
  /** POST /api/conversaciones/:id/ofertas */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const mensaje = await contenedor.crearOfertaChat.ejecutar(
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
  static async aceptar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const contrato = await contenedor.aceptarOfertaChat.ejecutar(
        parsearId(req.params.id, 'la oferta'),
        usuarioId
      );
      res.json({ mensaje: 'Oferta aceptada y contrato creado', contrato });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/ofertas-chat/:id/rechazar */
  static async rechazar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      await contenedor.rechazarOfertaChat.ejecutar(
        parsearId(req.params.id, 'la oferta'),
        usuarioId
      );
      res.json({ mensaje: 'Oferta rechazada' });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/ofertas-chat/:id/contraoferta */
  static async contraofertar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const mensaje = await contenedor.contraofertar.ejecutar(
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
