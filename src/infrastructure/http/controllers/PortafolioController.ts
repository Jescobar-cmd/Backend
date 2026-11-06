import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId, parsearIdParam } from '../helpers/peticion.helper';

export class PortafolioController {
  /** GET /api/freelancer/portafolio */
  static async listar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const items = await contenedor.listarPortafolio.ejecutar(freelancerId);
      res.json({ total: items.length, items });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/usuarios/:id/portafolio */
  static async listarPublico(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = parsearIdParam(req.params.id, 'El id del freelancer no es válido');
      const items = await contenedor.listarPortafolio.ejecutar(freelancerId);
      res.json({ total: items.length, items });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/freelancer/portafolio */
  static async crear(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const item = await contenedor.crearPortafolioItem.ejecutar(freelancerId, req.body);
      res.status(201).json({ mensaje: 'Ítem agregado al portafolio', item });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/freelancer/portafolio/:id */
  static async actualizar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const itemId = parsearIdParam(req.params.id, 'El id del ítem no es válido');
      const item = await contenedor.actualizarPortafolioItem.ejecutar(
        freelancerId,
        itemId,
        req.body
      );
      res.json({ mensaje: 'Ítem del portafolio actualizado', item });
    } catch (e) {
      next(e);
    }
  }

  /** DELETE /api/freelancer/portafolio/:id */
  static async eliminar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const itemId = parsearIdParam(req.params.id, 'El id del ítem no es válido');
      await contenedor.eliminarPortafolioItem.ejecutar(freelancerId, itemId);
      res.json({ mensaje: 'Ítem del portafolio eliminado' });
    } catch (e) {
      next(e);
    }
  }
}
