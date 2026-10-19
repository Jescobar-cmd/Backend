import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { ForbiddenError } from '../../../shared/errors/AppError';

/**
 * Middleware reutilizable: restringe el acceso a los roles indicados.
 * Debe usarse SIEMPRE después de requireAuth (que llena req.user).
 * Roles del sistema: 2 = Freelancer, 3 = Cliente.
 */
export function requireRole(...rolesPermitidos: number[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const rol = req.user?.rol;
    if (rol === undefined || !rolesPermitidos.includes(rol)) {
      return next(new ForbiddenError('No tienes permisos para acceder a este recurso'));
    }
    next();
  };
}
