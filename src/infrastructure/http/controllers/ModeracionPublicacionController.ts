import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import {
  obtenerUsuarioId,
  parsearIdParam,
} from '../helpers/peticion.helper';
import { ErrorSolicitudInvalida } from '../../../shared/errors/ErrorAplicacion';
import { TipoPublicacion } from '../../../domain/entities/ModeracionPublicacion';

function parsearTipo(valor: string): TipoPublicacion {
  if (valor === 'servicio' || valor === 'proyecto') {
    return valor;
  }
  throw new ErrorSolicitudInvalida('El tipo de publicación debe ser servicio o proyecto');
}

/**
 * Controlador delgado del módulo de moderación de publicaciones.
 * La validación de body/query ya la hace el middleware `validar` en las rutas.
 */
export class ModeracionPublicacionController {
  /** GET /api/moderador/publicaciones */
  static async listar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, tipo, estado, texto } = req.query as unknown as {
        page: number;
        limit: number;
        tipo: TipoPublicacion;
        estado?: string;
        texto?: string;
      };
      const resultado = await contenedor.listarPublicacionesModeracion.ejecutar({
        tipo,
        ...(estado ? { estado } : {}),
        ...(texto ? { texto } : {}),
        page,
        limit,
      });
      res.json(resultado);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/moderador/publicaciones/:tipo/:id */
  static async detalle(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tipo = parsearTipo(req.params.tipo);
      const id = parsearIdParam(req.params.id, 'publicación');
      const publicacion = await contenedor.obtenerPublicacionModeracion.ejecutar(id, tipo);
      res.json({ publicacion });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/moderador/publicaciones/:tipo/:id/retirar */
  static async retirar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tipo = parsearTipo(req.params.tipo);
      const id = parsearIdParam(req.params.id, 'publicación');
      const moderadorId = obtenerUsuarioId(req);
      const motivo = (req.body as { motivo: string }).motivo;

      const resultado = await contenedor.moderarPublicacion.retirar(
        id,
        tipo,
        motivo,
        moderadorId
      );
      res.json({ mensaje: resultado.mensaje, publicacion: resultado.publicacion });
    } catch (e) {
      next(e);
    }
  }

  /** PATCH /api/moderador/publicaciones/:tipo/:id/reactivar */
  static async reactivar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tipo = parsearTipo(req.params.tipo);
      const id = parsearIdParam(req.params.id, 'publicación');
      const moderadorId = obtenerUsuarioId(req);

      const resultado = await contenedor.moderarPublicacion.reactivar(id, tipo, moderadorId);
      res.json({ mensaje: resultado.mensaje, publicacion: resultado.publicacion });
    } catch (e) {
      next(e);
    }
  }
}
