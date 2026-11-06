import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorNoAutorizado, ErrorSolicitudInvalida } from '../../../shared/errors/ErrorAplicacion';

function parsearId(valor: string, mensaje: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorSolicitudInvalida(mensaje);
  }
  return id;
}

export class PortafolioController {
  /** GET /api/freelancer/portafolio */
  static async listar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = req.usuario?.id;
      if (!freelancerId) throw new ErrorNoAutorizado('No autorizado');

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
      const freelancerId = parsearId(req.params.id, 'El id del freelancer no es válido');
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
      const freelancerId = req.usuario?.id;
      if (!freelancerId) throw new ErrorNoAutorizado('No autorizado');

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
      const freelancerId = req.usuario?.id;
      if (!freelancerId) throw new ErrorNoAutorizado('No autorizado');

      const item = await contenedor.actualizarPortafolioItem.ejecutar(
        freelancerId,
        parsearId(req.params.id, 'El id del ítem no es válido'),
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
      const freelancerId = req.usuario?.id;
      if (!freelancerId) throw new ErrorNoAutorizado('No autorizado');

      await contenedor.eliminarPortafolioItem.ejecutar(
        freelancerId,
        parsearId(req.params.id, 'El id del ítem no es válido')
      );
      res.json({ mensaje: 'Ítem del portafolio eliminado' });
    } catch (e) {
      next(e);
    }
  }
}
