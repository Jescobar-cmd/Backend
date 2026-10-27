import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorSolicitudInvalida('El id de la oferta no es válido');
  }
  return id;
}

export class OfertaController {
  /** POST /api/cliente/ofertas */
  static async crear(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.usuario?.id;
      if (!clienteId) throw new ErrorNoAutorizado('No autorizado');
      const oferta = await contenedor.crearOferta.ejecutar(clienteId, req.body);
      res.status(201).json({ mensaje: 'Oferta publicada correctamente', oferta });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/cliente/ofertas?estado=&q=&page=&limit= */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.usuario?.id;
      if (!clienteId) throw new ErrorNoAutorizado('No autorizado');

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
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
      const clienteId = req.usuario?.id;
      if (!clienteId) throw new ErrorNoAutorizado('No autorizado');
      const oferta = await contenedor.obtenerMiOferta.ejecutar(clienteId, parsearId(req.params.id));
      res.json(oferta);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/cliente/ofertas/:id */
  static async actualizar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.usuario?.id;
      if (!clienteId) throw new ErrorNoAutorizado('No autorizado');
      const oferta = await contenedor.actualizarOferta.ejecutar(clienteId, parsearId(req.params.id), req.body);
      res.json({ mensaje: 'Oferta actualizada correctamente', oferta });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/cliente/ofertas/:id/estado */
  static async cambiarEstado(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.usuario?.id;
      if (!clienteId) throw new ErrorNoAutorizado('No autorizado');
      const oferta = await contenedor.cambiarEstadoOferta.ejecutar(clienteId, parsearId(req.params.id), req.body.estado);
      res.json({ mensaje: `Estado actualizado a "${oferta.estado}"`, oferta });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/cliente/ofertas/:id/propuestas */
  static async propuestas(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const clienteId = req.usuario?.id;
      if (!clienteId) throw new ErrorNoAutorizado('No autorizado');
      const propuestas = await contenedor.listarPropuestasDeOferta.ejecutar(clienteId, parsearId(req.params.id));
      res.json({ total: propuestas.length, propuestas });
    } catch (e) {
      next(e);
    }
  }
}
