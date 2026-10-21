import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';

export class CategoriaController {
  /** GET /api/categorias */
  static async listar(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await container.listarCategorias.execute();
      res.json({ total: categorias.length, categorias });
    } catch (e) {
      next(e);
    }
  }
}
