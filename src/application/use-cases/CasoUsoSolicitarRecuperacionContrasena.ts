import crypto from 'crypto';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { RepositorioToken } from '../../domain/ports/repositories/RepositorioToken';
import { TokenRecuperacion } from '../../domain/entities/TokenRecuperacion';
import { EnviadorCorreo } from '../../domain/ports/services/EnviadorCorreo';

export class CasoUsoSolicitarRecuperacionContrasena {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private repositorioToken: RepositorioToken,
    private enviadorCorreo: EnviadorCorreo,
  ) {}

  async ejecutar(email: string): Promise<void> {
    const correoLimpiado = email.trim().toLowerCase();
    const usuario = await this.repositorioUsuario.buscarPorEmail(correoLimpiado);

    // Respuesta genérica para no filtrar qué correos existen
    if (!usuario || usuario.id === null) {
      return;
    }

    await this.repositorioToken.invalidarTodosPorUsuario(usuario.id);

    const codigo = crypto.randomInt(100000, 1000000).toString();
    const token = new TokenRecuperacion(
      null,
      usuario.id,
      codigo,
      new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    );

    await this.repositorioToken.guardar(token);
    await this.enviadorCorreo.enviarCorreoRecuperacionContrasena(usuario.email, codigo);
  }
}
