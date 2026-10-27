import { OAuth2Client } from 'google-auth-library';
import { VerificadorOAuth, PerfilUsuarioOAuth } from '../../domain/ports/services/VerificadorOAuth';
import { ErrorNoAutorizado } from '../../shared/errors/ErrorAplicacion';

// Adaptador de infraestructura: implementa el puerto VerificadorOAuth con Google Auth Library.
export class ServicioAutenticacionGoogle implements VerificadorOAuth {
  private cliente: OAuth2Client | null = null;
  private readonly idCliente: string | undefined;

  constructor() {
    this.idCliente = process.env.GOOGLE_CLIENT_ID;
    if (this.idCliente) {
      this.cliente = new OAuth2Client(this.idCliente);
    }
  }

  async verificarIdToken(idToken: string): Promise<PerfilUsuarioOAuth> {
    if (!this.idCliente || !this.cliente) {
      throw new ErrorNoAutorizado(
        'El inicio de sesión con Google no está configurado en el servidor (falta GOOGLE_CLIENT_ID)'
      );
    }

    try {
      const ticket = await this.cliente.verifyIdToken({
        idToken,
        audience: this.idCliente,
      });

      const datos = ticket.getPayload();
      if (!datos?.sub || !datos?.email || datos.email_verified === false) {
        throw new ErrorNoAutorizado('Token de Google inválido o correo no verificado por Google');
      }

      return {
        googleId: datos.sub,
        email: datos.email.toLowerCase(),
        nombre: datos.name ?? datos.email.split('@')[0],
      };
    } catch (error: unknown) {
      if (error instanceof ErrorNoAutorizado) throw error;
      const mensaje = error instanceof Error ? error.message : 'Token de Google inválido o expirado';
      throw new ErrorNoAutorizado(`Autenticación de Google fallida: ${mensaje}`);
    }
  }
}
