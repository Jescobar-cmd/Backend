import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorSolicitudInvalida, ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

export class PerfilController {
  /** GET /api/cliente/perfil -> perfil propio del cliente. */
  static async miPerfil(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        throw new ErrorNoAutorizado('No autorizado');
      }
      const perfil = await contenedor.obtenerMiPerfil.ejecutar(usuarioId);
      res.json(perfil);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/cliente/perfil -> actualiza campos del perfil propio. */
  static async actualizarMiPerfil(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        throw new ErrorNoAutorizado('No autorizado');
      }
      const perfil = await contenedor.actualizarMiPerfil.ejecutar(usuarioId, req.body);
      res.json({ mensaje: 'Perfil actualizado correctamente', perfil });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/usuarios/:id -> perfil público (sin email ni teléfono). */
  static async perfilPublico(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new ErrorSolicitudInvalida('El id del usuario no es válido');
      }
      const perfil = await contenedor.obtenerPerfilPublico.ejecutar(id);
      res.json(perfil);
    } catch (e) {
      next(e);
    }
  }
}
