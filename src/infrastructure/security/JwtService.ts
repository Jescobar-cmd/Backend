import jwt from 'jsonwebtoken';
import { TokenService } from '../../domain/ports/services/TokenService';

// Adaptador de infraestructura: implementa el puerto TokenService con jsonwebtoken.
export class JwtService implements TokenService {
  private readonly secret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('Falta JWT_SECRET en el .env');
    this.secret = secret;
  }

  generateToken(payload: { id: number; email: string; rol: number }): string {
    return jwt.sign(payload, this.secret, { expiresIn: '24h' });
  }

  verifyToken(token: string): { id: number; email: string; rol: number } {
    return jwt.verify(token, this.secret) as { id: number; email: string; rol: number };
  }
}
