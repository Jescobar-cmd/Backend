import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId, parsearIdParam } from '../helpers/peticion.helper';

export class DisputaContratoController {
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
