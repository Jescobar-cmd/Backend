import { Response, NextFunction } from 'express';
import { SolicitudAutenticada } from './middlewareAutenticacion';
import { ErrorProhibido } from '../../../shared/errors/ErrorAplicacion';

/**
 * Middleware reutilizable: restringe el acceso a los roles indicados.
 * Debe usarse SIEMPRE después de requiereAutenticacion (que llena req.usuario).
 * Roles del sistema: 2 = Freelancer, 3 = Cliente.
 */
export function requiereRol(...rolesPermitidos: number[]) {
  return (req: SolicitudAutenticada, _res: Response, next: NextFunction) => {
    const rol = req.usuario?.rol;
    if (rol === undefined || !rolesPermitidos.includes(rol)) {
      return next(new ErrorProhibido('No tienes permisos para acceder a este recurso'));
    }
    next();
  };
}
