import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId, parsearIdParam } from '../helpers/peticion.helper';

export class PropuestaController {
  /** POST /api/ofertas/:id/propuestas */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'la oferta');

      const propuesta = await contenedor.crearPropuesta.ejecutar(
        freelancerId,
        ofertaId,
        req.body
      );
      res.status(201).json({ mensaje: 'Propuesta enviada correctamente', propuesta });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/propuestas */
  static async misPropuestas(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const propuestas = await contenedor.listarMisPropuestas.ejecutar(freelancerId);
      res.json({ total: propuestas.length, propuestas });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/freelancer/propuestas/:id/retirar */
  static async retirar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const propuestaId = parsearIdParam(req.params.id, 'la propuesta');

      const propuesta = await contenedor.retirarPropuesta.ejecutar(
        freelancerId,
        propuestaId
      );
      res.json({ mensaje: 'Propuesta retirada correctamente', propuesta });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/cliente/ofertas/:id/propuestas/:propuestaId/aceptar */
  static async aceptar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'la oferta');
      const propuestaId = parsearIdParam(req.params.propuestaId, 'la propuesta');

      const contrato = await contenedor.aceptarPropuesta.ejecutar(
        clienteId,
        ofertaId,
        propuestaId
      );
      res.json({ mensaje: 'Propuesta aceptada y contrato creado', contrato });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/cliente/ofertas/:id/propuestas/:propuestaId/rechazar */
  static async rechazar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'la oferta');
      const propuestaId = parsearIdParam(req.params.propuestaId, 'la propuesta');

      await contenedor.rechazarPropuesta.ejecutar(
        clienteId,
        ofertaId,
        propuestaId
      );
      res.json({ mensaje: 'Propuesta rechazada' });
    } catch (e) {
      next(e);
    }
  }
}
