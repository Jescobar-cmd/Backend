import jwt, { SignOptions } from 'jsonwebtoken';
import { DatosToken, ServicioToken } from '../../domain/ports/services/ServicioToken';
import { ErrorNoAutorizado } from '../../shared/errors/ErrorAplicacion';
import { entorno } from '../../config/entorno';

export class ServicioJwt implements ServicioToken {
  private readonly secreto: string;
  private readonly expiracion: string;

  constructor() {
    this.secreto = entorno.JWT_SECRET;
    this.expiracion = entorno.JWT_EXPIRES_IN;
  }

  generarToken(datos: DatosToken): string {
    return jwt.sign(datos, this.secreto, {
      expiresIn: this.expiracion as SignOptions['expiresIn'],
    });
  }

  verificarToken(token: string): DatosToken {
    try {
      const decodificado = jwt.verify(token, this.secreto) as DatosToken;
      if (!decodificado || typeof decodificado !== 'object' || !decodificado.id || !decodificado.email) {
        throw new ErrorNoAutorizado('Token con formato inválido');
      }
      return decodificado;
    } catch (error: unknown) {
      if (error instanceof ErrorNoAutorizado) throw error;
      throw new ErrorNoAutorizado('Sesión inválida o expirada, inicia sesión de nuevo');
    }
  }
}
