import { Request, Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { DatosToken } from '../../../domain/ports/services/ServicioToken';
import { entorno } from '../../../config/entorno';
import {
  ErrorNoAutorizado,
  ErrorProhibido,
} from '../../../shared/errors/ErrorAplicacion';

export interface SolicitudAutenticada extends Request {
  usuario?: DatosToken;
}

/**
 * Verifica el JWT y, fuera de pruebas, revalida contra la base de datos que la
 * cuenta siga existiendo, activa y con el mismo rol. Así una suspensión o un
 * cambio de rol revocan el acceso de inmediato, sin esperar a que expire el token.
 */
export async function requiereAutenticacion(
  req: SolicitudAutenticada,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ErrorNoAutorizado('No autorizado, debes iniciar sesión'));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new ErrorNoAutorizado('No autorizado, token no proporcionado'));
  }

  try {
    const datos = contenedor.jwt.verificarToken(token);

    // En tests se usan tokens sintéticos sin fila en la base de datos.
    if (entorno.NODE_ENV === 'test') {
      req.usuario = datos;
      return next();
    }

    const usuario = await contenedor.usuarios.buscarPorId(datos.id);
    if (!usuario) {
      throw new ErrorNoAutorizado('Tu cuenta ya no existe, inicia sesión de nuevo');
    }
    if (usuario.estaSuspendido()) {
      throw new ErrorProhibido(
        'Tu cuenta está suspendida. Contacta a la moderación de FirstGig.'
      );
    }
    if (!usuario.esActivo()) {
      throw new ErrorNoAutorizado('Tu cuenta no está activa');
    }
    if (usuario.rolId !== datos.rol) {
      throw new ErrorNoAutorizado(
        'Tu rol cambió, inicia sesión de nuevo para continuar'
      );
    }

    req.usuario = { ...datos, rol: usuario.rolId };
    next();
  } catch (err) {
    next(err);
  }
}
