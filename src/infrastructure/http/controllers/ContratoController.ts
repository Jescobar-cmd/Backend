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
}
