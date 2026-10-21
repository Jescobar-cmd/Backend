import { Response, NextFunction } from 'express';
import { container } from '../container';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BadRequestError, UnauthorizedError } from '../../../shared/errors/AppError';

export class PerfilController {
  /** GET /api/cliente/perfil -> perfil propio del cliente. */
  static async miPerfil(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        throw new UnauthorizedError('No autorizado');
      }
      const perfil = await container.obtenerMiPerfil.execute(usuarioId);
      res.json(perfil);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/cliente/perfil -> actualiza campos del perfil propio. */
  static async actualizarMiPerfil(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        throw new UnauthorizedError('No autorizado');
      }
      const perfil = await container.actualizarMiPerfil.execute(usuarioId, req.body);
      res.json({ mensaje: 'Perfil actualizado correctamente', perfil });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/usuarios/:id -> perfil público (sin email ni teléfono). */
  static async perfilPublico(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError('El id del usuario no es válido');
      }
      const perfil = await container.obtenerPerfilPublico.execute(id);
      res.json(perfil);
    } catch (e) {
      next(e);
    }
  }
}
