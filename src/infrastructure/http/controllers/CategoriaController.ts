import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';

export class CategoriaController {
  /** GET /api/categorias */
  static async listar(_req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await contenedor.listarCategorias.ejecutar();
      res.json({ total: categorias.length, categorias });
    } catch (e) {
      next(e);
    }
  }
}
