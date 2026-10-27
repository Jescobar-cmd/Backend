import { Request, Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { DatosToken } from '../../../domain/ports/services/ServicioToken';
import { ErrorNoAutorizado } from '../../../shared/errors/ErrorAplicacion';

export interface SolicitudAutenticada extends Request {
  usuario?: DatosToken;
}

export function requiereAutenticacion(req: SolicitudAutenticada, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ErrorNoAutorizado('No autorizado, debes iniciar sesión'));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new ErrorNoAutorizado('No autorizado, token no proporcionado'));
  }

  try {
    req.usuario = contenedor.jwt.verificarToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
