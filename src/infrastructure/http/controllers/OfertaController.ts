import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  parsearIdParam,
  parsearPaginacion,
} from '../helpers/peticion.helper';

export class OfertaController {
  /** POST /api/cliente/ofertas */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const oferta = await contenedor.crearOferta.ejecutar(clienteId, req.body);
      res.status(201).json({ mensaje: 'Oferta publicada correctamente', oferta });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/cliente/ofertas?estado=&q=&page=&limit= */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const { page, limit } = parsearPaginacion(req.query, { page: 1, limit: 10, maxLimit: 50 });
      const estado = typeof req.query.estado === 'string' && req.query.estado ? req.query.estado : undefined;
      const texto = typeof req.query.q === 'string' && req.query.q ? req.query.q : undefined;

      const resultado = await contenedor.listarMisOfertas.ejecutar(clienteId, { page, limit, estado, texto });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/cliente/ofertas/:id */
  static async detalle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'oferta');
      const oferta = await contenedor.obtenerMiOferta.ejecutar(clienteId, ofertaId);
      res.json(oferta);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/cliente/ofertas/:id */
  static async actualizar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'oferta');
      const oferta = await contenedor.actualizarOferta.ejecutar(clienteId, ofertaId, req.body);
      res.json({ mensaje: 'Oferta actualizada correctamente', oferta });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/cliente/ofertas/:id/estado */
  static async cambiarEstado(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'oferta');
      const oferta = await contenedor.cambiarEstadoOferta.ejecutar(clienteId, ofertaId, req.body.estado);
      res.json({ mensaje: `Estado actualizado a "${oferta.estado}"`, oferta });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/cliente/ofertas/:id/propuestas */
  static async propuestas(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const ofertaId = parsearIdParam(req.params.id, 'oferta');
      const propuestas = await contenedor.listarPropuestasDeOferta.ejecutar(clienteId, ofertaId);
      res.json({ total: propuestas.length, propuestas });
    } catch (e) {
      next(e);
    }
  }
}
