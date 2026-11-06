import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { ErrorNoAutorizado, ErrorSolicitudInvalida } from '../../../shared/errors/ErrorAplicacion';

/**
 * Parsea y valida un ID numérico proveniente de parámetros de ruta (req.params).
 * Lanza ErrorSolicitudInvalida (400) si no es un entero positivo.
 */
export function parsearIdParam(valor: unknown, etiquetaOMensaje: string = 'recurso'): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    if (etiquetaOMensaje.includes(' ')) {
      const lower = etiquetaOMensaje.toLowerCase();
      const msg = lower.startsWith('el ') || lower.startsWith('la ')
        ? (etiquetaOMensaje.includes('no es válido') ? etiquetaOMensaje : `El id de ${etiquetaOMensaje} no es válido`)
        : (etiquetaOMensaje.includes('no es válido') ? etiquetaOMensaje : `El id del ${etiquetaOMensaje} no es válido`);
      throw new ErrorSolicitudInvalida(msg);
    }
    throw new ErrorSolicitudInvalida(`El id del ${etiquetaOMensaje} no es válido`);
  }
  return id;
}

/**
 * Obtiene el ID del usuario autenticado garantizando su existencia o lanzando 401.
 */
export function obtenerUsuarioId(req: SolicitudAutenticada): number {
  const usuarioId = req.usuario?.id;
  if (!usuarioId) {
    throw new ErrorNoAutorizado('No autorizado');
  }
  return usuarioId;
}

/**
 * Obtiene el ID y el rol del usuario autenticado garantizando su existencia o lanzando 401.
 */
export function obtenerUsuarioSesion(req: SolicitudAutenticada): { id: number; rol: number; email: string } {
  const usuario = req.usuario;
  if (!usuario?.id || usuario.rol === undefined) {
    throw new ErrorNoAutorizado('No autorizado');
  }
  return { id: usuario.id, rol: usuario.rol, email: usuario.email };
}

/**
 * Parsea y acota parámetros de paginación segura desde query params.
 */
export function parsearPaginacion(
  query: { page?: unknown; limit?: unknown },
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): { page: number; limit: number } {
  const defPage = defaults.page ?? 1;
  const defLimit = defaults.limit ?? 10;
  const maxLimit = defaults.maxLimit ?? 50;

  const page = Math.max(1, Number(query.page) || defPage);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defLimit));
  return { page, limit };
}

/**
 * Parsea un entero positivo opcional desde query o params.
 */
export function parsearEnteroOpcional(valor: unknown, nombre: string): number | undefined {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const num = Number(valor);
  if (!Number.isInteger(num) || num <= 0) {
    throw new ErrorSolicitudInvalida(`El ${nombre} no es válido`);
  }
  return num;
}
