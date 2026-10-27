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

export class PropuestaController {
  /** POST /api/ofertas/:id/propuestas */
  static async crear(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.id;
      if (!freelancerId) throw new UnauthorizedError('No autorizado');

      const propuesta = await container.crearPropuesta.execute(
        freelancerId,
        parsearId(req.params.id, 'la oferta'),
        req.body
      );
      res.status(201).json({ mensaje: 'Propuesta enviada correctamente', propuesta });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/propuestas */
  static async misPropuestas(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.id;
      if (!freelancerId) throw new UnauthorizedError('No autorizado');

      const propuestas = await container.listarMisPropuestas.execute(freelancerId);
      res.json({ total: propuestas.length, propuestas });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/cliente/ofertas/:id/propuestas/:propuestaId/aceptar */
  static async aceptar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.user?.id;
      if (!clienteId) throw new UnauthorizedError('No autorizado');

      const contrato = await container.aceptarPropuesta.execute(
        clienteId,
        parsearId(req.params.id, 'la oferta'),
        parsearId(req.params.propuestaId, 'la propuesta')
      );
      res.json({ mensaje: 'Propuesta aceptada y contrato creado', contrato });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/cliente/ofertas/:id/propuestas/:propuestaId/rechazar */
  static async rechazar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.user?.id;
      if (!clienteId) throw new UnauthorizedError('No autorizado');

      await container.rechazarPropuesta.execute(
        clienteId,
        parsearId(req.params.id, 'la oferta'),
        parsearId(req.params.propuestaId, 'la propuesta')
      );
      res.json({ mensaje: 'Propuesta rechazada' });
    } catch (e) {
      next(e);
    }
  }
}
