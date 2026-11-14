import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId, parsearIdParam } from '../helpers/peticion.helper';

export class EntregaContratoController {
  /** POST /api/contratos/:id/entregas */
  static async registrarEntrega(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const entrega = await contenedor.registrarEntregaContrato.ejecutar(
        contratoId,
        freelancerId,
        req.body
      );
      res.status(201).json({
        mensaje: 'Entrega registrada correctamente',
        entrega,
      });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/contratos/:id/entregas */
  static async entregas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const entregas = await contenedor.listarEntregasContrato.ejecutar(
        contratoId,
        usuarioId
      );
      res.json({ total: entregas.length, entregas });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/contratos/:id/aprobar-entrega */
  static async aprobarEntrega(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const resultado = await contenedor.aprobarEntrega.ejecutar(
        contratoId,
        clienteId
      );
      res.json({
        mensaje: 'Entrega aprobada y contrato completado correctamente',
        contrato: resultado.contrato,
        entrega: resultado.entrega,
      });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/contratos/:id/entregas/:entregaId */
  static async actualizarEntrega(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const freelancerId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const entregaId = parsearIdParam(req.params.entregaId, 'entrega');
      const entrega = await contenedor.actualizarEntregaContrato.ejecutar(
        contratoId,
        entregaId,
        freelancerId,
        req.body
      );
      res.json({ mensaje: 'Entrega actualizada correctamente', entrega });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/contratos/:id/rechazar-entrega */
  static async rechazarEntrega(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const entrega = await contenedor.rechazarEntrega.ejecutar(
        contratoId,
        clienteId,
        req.body.observacion
      );
      res.json({ mensaje: 'Entrega rechazada correctamente', entrega });
    } catch (e) {
      next(e);
    }
  }
}
