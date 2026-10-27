import crypto from 'crypto';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { RepositorioToken } from '../../domain/ports/repositories/RepositorioToken';
import { TokenRecuperacion } from '../../domain/entities/TokenRecuperacion';
import { EnviadorCorreo } from '../../domain/ports/services/EnviadorCorreo';

export class CasoUsoReenviarCodigo {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private repositorioToken: RepositorioToken,
    private enviadorCorreo: EnviadorCorreo,
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
      codigo,
      new Date(Date.now() + 15 * 60 * 1000)
    );

    await this.repositorioToken.guardar(token);
    await this.enviadorCorreo.enviarCorreoVerificacion(usuario.email, codigo);
  }
}
