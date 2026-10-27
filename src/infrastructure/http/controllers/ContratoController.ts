import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BadRequestError, UnauthorizedError } from '../../../shared/errors/AppError';

function parsearId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError('El id del contrato no es válido');
  }
  return id;
}

export class ContratoController {
  /** GET /api/contratos */
  static async listar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const contratos = await container.listarContratos.execute(usuarioId);
      res.json({ total: contratos.length, contratos });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/contratos/:id */
  static async detalle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) throw new UnauthorizedError('No autorizado');

      const contrato = await container.obtenerContrato.execute(
        parsearId(req.params.id),
        usuarioId
      );
      res.json(contrato);
    } catch (e) {
      next(e);
    }
  }
}
