import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorSolicitudInvalida('El id del contrato no es válido');
  }
  return id;
}

export class ContratoController {
  /** GET /api/contratos */
  static async listar(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const contratos = await contenedor.listarContratos.ejecutar(usuarioId);
      res.json({ total: contratos.length, contratos });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/contratos/:id */
  static async detalle(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const contrato = await contenedor.obtenerContrato.ejecutar(
        parsearId(req.params.id),
        usuarioId
      );
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
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const contrato = await contenedor.cambiarEstadoContrato.ejecutar(
        parsearId(req.params.id),
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
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const resultado = await contenedor.listarCalificacionesContrato.ejecutar(
        parsearId(req.params.id),
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
      const usuarioId = req.usuario?.id;
      if (!usuarioId) throw new ErrorNoAutorizado('No autorizado');

      const calificacion = await contenedor.calificarContrato.ejecutar(
        parsearId(req.params.id),
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
}
