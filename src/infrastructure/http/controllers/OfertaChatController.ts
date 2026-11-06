import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId, parsearIdParam } from '../helpers/peticion.helper';

export class OfertaChatController {
  /** POST /api/conversaciones/:id/ofertas */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const conversacionId = parsearIdParam(req.params.id, 'la conversación');

      const mensaje = await contenedor.crearOfertaChat.ejecutar(
        conversacionId,
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
      const usuarioId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'la oferta');

      const contrato = await contenedor.aceptarOfertaChat.ejecutar(
        ofertaId,
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
      const usuarioId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'la oferta');

      await contenedor.rechazarOfertaChat.ejecutar(
        ofertaId,
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
      const usuarioId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'la oferta');

      const mensaje = await contenedor.contraofertar.ejecutar(
        ofertaId,
        usuarioId,
        req.body
      );
      res.status(201).json(mensaje);
    } catch (e) {
      next(e);
    }
  }
}
