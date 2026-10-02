import { Request, Response, NextFunction } from 'express';
import { container } from '../container';
import { TokenPayload } from '../../../domain/ports/services/TokenService';
import { UnauthorizedError } from '../../../shared/errors/AppError';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No autorizado, debes iniciar sesión'));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new UnauthorizedError('No autorizado, token no proporcionado'));
  }

  try {
    req.user = container.jwt.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
