import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload, TokenService } from '../../domain/ports/services/TokenService';
import { UnauthorizedError } from '../../shared/errors/AppError';

export class JwtService implements TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Falta JWT_SECRET en las variables de entorno (.env)');
    }
    this.secret = secret;
    this.expiresIn = process.env.JWT_EXPIRES_IN ?? '24h';
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as SignOptions['expiresIn'] });
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.email) {
        throw new UnauthorizedError('Token con formato inválido');
      }
      return decoded;
    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Sesión inválida o expirada, inicia sesión de nuevo');
    }
  }
}
