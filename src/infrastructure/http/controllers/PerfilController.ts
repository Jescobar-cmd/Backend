import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId, parsearIdParam } from '../helpers/peticion.helper';

export class PerfilController {
  /** GET /api/cliente/perfil -> perfil propio del cliente. */
  static async miPerfil(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const perfil = await contenedor.obtenerMiPerfil.ejecutar(usuarioId);
      res.json(perfil);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/cliente/perfil -> actualiza campos del perfil propio. */
  static async actualizarMiPerfil(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const perfil = await contenedor.actualizarMiPerfil.ejecutar(usuarioId, req.body);
      res.json({ mensaje: 'Perfil actualizado correctamente', perfil });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/freelancer/perfil -> perfil propio del freelancer. */
  static async miPerfilFreelancer(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const perfil = await contenedor.obtenerMiPerfilFreelancer.ejecutar(usuarioId);
      res.json(perfil);
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/freelancer/perfil -> actualiza perfil y habilidades. */
  static async actualizarMiPerfilFreelancer(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const perfil = await contenedor.actualizarMiPerfilFreelancer.ejecutar(
        usuarioId,
        req.body
      );
      res.json({ mensaje: 'Perfil actualizado correctamente', perfil });
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/usuarios/:id -> perfil público (sin email ni teléfono). */
  static async perfilPublico(req: SolicitudAutenticada, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parsearIdParam(req.params.id, 'usuario');
      // Delegado al caso de uso: orquestación de perfiles y métricas sin filtración de reglas a HTTP
      const perfil = await contenedor.obtenerPerfilPublico.ejecutar(id, req.usuario?.id);
      res.json(perfil);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/usuarios/:id/calificaciones -> reseñas públicas recibidas. */
  static async calificacionesPublicas(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = parsearIdParam(req.params.id, 'usuario');
      const limite = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const calificaciones = await contenedor.listarCalificacionesFreelancer.ejecutar(
        id,
        limite
      );
      res.json({ total: calificaciones.length, calificaciones });
    } catch (e) {
      next(e);
    }
  }
}
