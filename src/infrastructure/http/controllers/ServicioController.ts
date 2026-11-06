import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  parsearIdParam,
  parsearPaginacion,
  parsearEnteroOpcional,
} from '../helpers/peticion.helper';

function parsearTexto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : undefined;
}

export class ServicioController {
  /** POST /api/servicios */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const servicio = await contenedor.crearServicio.ejecutar(freelancerId, req.body);
      res.status(201).json({ mensaje: 'Servicio publicado correctamente', servicio });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/servicios?page=&limit=&categoriaId=&q= */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = parsearPaginacion(req.query, { page: 1, limit: 10, maxLimit: 50 });

      const resultado = await contenedor.listarServicios.ejecutar({
        page,
        limit,
        categoriaId: parsearEnteroOpcional(req.query.categoriaId, 'categoriaId'),
        freelancerId: parsearEnteroOpcional(req.query.freelancerId, 'freelancerId'),
        texto: parsearTexto(req.query.q),
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/usuarios/:id/servicios?page=&limit= */
  static async porFreelancer(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = parsearIdParam(req.params.id, 'freelancer');
      const { page, limit } = parsearPaginacion(req.query, { page: 1, limit: 10, maxLimit: 50 });

      const resultado = await contenedor.listarServicios.ejecutar({
        page,
        limit,
        freelancerId,
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/servicios/:id */
  static async detalle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicioId = parsearIdParam(req.params.id, 'servicio');
      const servicio = await contenedor.obtenerServicio.ejecutar(servicioId);
      res.json(servicio);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/servicios/:id */
  static async actualizar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const servicioId = parsearIdParam(req.params.id, 'servicio');
      const servicio = await contenedor.actualizarServicio.ejecutar(
        freelancerId,
        servicioId,
        req.body
      );
      res.json({ mensaje: 'Servicio actualizado correctamente', servicio });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/servicios/:id/estado */
  static async cambiarEstado(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const servicioId = parsearIdParam(req.params.id, 'servicio');
      const servicio = await contenedor.cambiarEstadoServicio.ejecutar(
        freelancerId,
        servicioId,
        req.body.estado
      );
      res.json({ mensaje: `Estado actualizado a "${servicio.estado}"`, servicio });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/servicios?page=&limit=&estado=&q= */
  static async misServicios(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const { page, limit } = parsearPaginacion(req.query, { page: 1, limit: 10, maxLimit: 50 });

      const resultado = await contenedor.listarMisServicios.ejecutar(freelancerId, {
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
