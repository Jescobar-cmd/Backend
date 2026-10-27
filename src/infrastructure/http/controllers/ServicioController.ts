import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BadRequestError, UnauthorizedError } from '../../../shared/errors/AppError';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError('El id del servicio no es válido');
  }
  return id;
}

function parsearEnteroPositivo(valor: unknown, nombre: string): number | undefined {
  if (typeof valor !== 'string' || !valor) return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new BadRequestError(`El ${nombre} no es válido`);
  }
  return numero;
}

function parsearTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor ? valor : undefined;
}

export class ServicioController {
  /** POST /api/servicios */
  static async crear(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.id;
      if (!freelancerId) throw new UnauthorizedError('No autorizado');
      const servicio = await container.crearServicio.execute(freelancerId, req.body);
      res.status(201).json({ mensaje: 'Servicio publicado correctamente', servicio });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/servicios?page=&limit=&categoriaId=&q= */
  static async listar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      const resultado = await container.listarServicios.execute({
        page,
        limit,
        categoriaId: parsearEnteroPositivo(req.query.categoriaId, 'categoriaId'),
        texto: parsearTexto(req.query.q),
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/servicios/:id */
  static async detalle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicio = await container.obtenerServicio.execute(parsearId(req.params.id));
      res.json(servicio);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/servicios/:id */
  static async actualizar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.id;
      if (!freelancerId) throw new UnauthorizedError('No autorizado');
      const servicio = await container.actualizarServicio.execute(
        freelancerId,
        parsearId(req.params.id),
        req.body
      );
      res.json({ mensaje: 'Servicio actualizado correctamente', servicio });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/servicios/:id/estado */
  static async cambiarEstado(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.id;
      if (!freelancerId) throw new UnauthorizedError('No autorizado');
      const servicio = await container.cambiarEstadoServicio.execute(
        freelancerId,
        parsearId(req.params.id),
        req.body.estado
      );
      res.json({ mensaje: `Estado actualizado a "${servicio.estado}"`, servicio });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/servicios?page=&limit=&estado=&q= */
  static async misServicios(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.id;
      if (!freelancerId) throw new UnauthorizedError('No autorizado');

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      const resultado = await container.listarMisServicios.execute(freelancerId, {
        page,
        limit,
        estado: parsearTexto(req.query.estado),
        texto: parsearTexto(req.query.q),
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }
}
