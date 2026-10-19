import { OAuth2Client } from 'google-auth-library';
import { OAuthVerifier, OAuthUserProfile } from '../../domain/ports/services/OAuthVerifier';
import { UnauthorizedError } from '../../shared/errors/AppError';

// Adaptador de infraestructura: implementa el puerto OAuthVerifier con Google Auth Library.
export class GoogleAuthService implements OAuthVerifier {
  private client: OAuth2Client | null = null;
  private readonly clientId: string | undefined;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    if (this.clientId) {
      this.client = new OAuth2Client(this.clientId);
    }
  }

  async verifyIdToken(idToken: string): Promise<OAuthUserProfile> {
    if (!this.clientId || !this.client) {
      throw new UnauthorizedError(
        'El inicio de sesión con Google no está configurado en el servidor (falta GOOGLE_CLIENT_ID)'
      );
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.sub || !payload?.email || payload.email_verified === false) {
        throw new UnauthorizedError('Token de Google inválido o correo no verificado por Google');
      }

      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        nombre: payload.name ?? payload.email.split('@')[0],
      };
    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) throw err;
      const message = err instanceof Error ? err.message : 'Token de Google inválido o expirado';
      throw new UnauthorizedError(`Autenticación de Google fallida: ${message}`);
    }
  }
}
