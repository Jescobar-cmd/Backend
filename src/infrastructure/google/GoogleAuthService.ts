import { OAuth2Client } from 'google-auth-library';

export interface GoogleProfile {
  googleId: string;
  email: string;
  nombre: string;
}

// Adaptador de infraestructura: valida el token que Google le dio al frontend
// y extrae quién es el usuario. El dominio nunca habla con Google directo.
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('Falta GOOGLE_CLIENT_ID en el .env');
    this.client = new OAuth2Client(clientId);
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email || payload.email_verified === false) {
      throw new Error('Token de Google inválido');
    }
    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      nombre: payload.name ?? payload.email.split('@')[0],
    };
  }
}
