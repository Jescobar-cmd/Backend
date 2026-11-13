import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId, parsearIdParam } from '../helpers/peticion.helper';

export class ContratoController {
  /** GET /api/contratos */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratos = await contenedor.listarContratos.ejecutar(usuarioId);
      res.json({ total: contratos.length, contratos });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/contratos/:id */
  static async detalle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const contrato = await contenedor.obtenerContrato.ejecutar(contratoId, usuarioId);
      res.json(contrato);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/contratos/:id/estado */
  static async cambiarEstado(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const contrato = await contenedor.cambiarEstadoContrato.ejecutar(
        contratoId,
        usuarioId,
        req.body.estado
      );
      res.json({
        mensaje:
          contrato.estado === 'completado'
            ? 'Contrato completado correctamente'
            : 'Contrato cancelado correctamente',
        contrato,
      });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/contratos/:id/calificaciones */
  static async calificaciones(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const resultado = await contenedor.listarCalificacionesContrato.ejecutar(
        contratoId,
        usuarioId
      );
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/contratos/:id/calificaciones */
  static async calificar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const calificacion = await contenedor.calificarContrato.ejecutar(
        contratoId,
        usuarioId,
        req.body
      );
      res.status(201).json({
        mensaje: 'Calificación registrada correctamente',
        calificacion,
      });
    } catch (e) {
      next(e);
    }
  }

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

  /** POST /api/contratos/:id/disputas */
  static async abrirDisputa(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const disputa = await contenedor.abrirDisputa.ejecutar(
        contratoId,
        usuarioId,
        req.body
      );
      res.status(201).json({
        mensaje: 'Disputa abierta correctamente',
        disputa,
      });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/contratos/:id/disputas */
  static async disputas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const disputas = await contenedor.listarDisputasContrato.ejecutar(
        contratoId,
        usuarioId
      );
      res.json({ total: disputas.length, disputas });
    } catch (e) {
      next(e);
    }
  }
}
