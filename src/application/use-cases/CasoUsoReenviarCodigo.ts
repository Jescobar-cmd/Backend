import crypto from 'crypto';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { RepositorioToken } from '../../domain/ports/repositories/RepositorioToken';
import { TokenRecuperacion } from '../../domain/entities/TokenRecuperacion';
import { EnviadorCorreo } from '../../domain/ports/services/EnviadorCorreo';
import { HasheadorCodigo } from '../../domain/ports/services/HasheadorCodigo';

const TIEMPO_EXPIRACION_CODIGO_MS = 15 * 60 * 1000; // 15 minutos

export class CasoUsoReenviarCodigo {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private repositorioToken: RepositorioToken,
    private enviadorCorreo: EnviadorCorreo,
    private hasheadorCodigo: HasheadorCodigo,
  ) {}

  async ejecutar(email: string): Promise<void> {
    const correoLimpiado = email.trim().toLowerCase();
    const usuario = await this.repositorioUsuario.buscarPorEmail(correoLimpiado);

    // Respuesta silenciosa para no filtrar qué correos existen
    if (!usuario || usuario.id === null || usuario.esActivo()) {
      return;
    }

    await this.repositorioToken.invalidarTodosPorUsuario(usuario.id);

    const codigo = crypto.randomInt(100000, 1000000).toString();
    const token = new TokenRecuperacion(
      null,
      usuario.id,
      this.hasheadorCodigo.hashear(codigo),
      new Date(Date.now() + TIEMPO_EXPIRACION_CODIGO_MS)
    );

    await this.repositorioToken.guardar(token);
    await this.enviadorCorreo.enviarCorreoVerificacion(usuario.email, codigo);
  }
}
