import { Request, Response, NextFunction } from 'express';
import { container } from '../container';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; rol: number };
}

// Protege rutas: exige "Authorization: Bearer <JWT>" válido.
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new Error('No autorizado, inicia sesión'));
  try {
    req.user = container.jwt.verifyToken(header.slice(7));
    next();
  } catch {
    next(new Error('Sesión inválida o expirada, inicia sesión de nuevo'));
  }
}
