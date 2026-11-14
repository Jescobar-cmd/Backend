import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { RepositorioToken } from '../../domain/ports/repositories/RepositorioToken';
import { HasheadorContrasena } from '../../domain/ports/services/HasheadorContrasena';
import { HasheadorCodigo } from '../../domain/ports/services/HasheadorCodigo';
import { ErrorSolicitudInvalida } from '../../shared/errors/ErrorAplicacion';

export interface DTOReestablecerContrasena {
  email: string;
  code: string;
  password: string;
}

export class CasoUsoRestablecerContrasena {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private repositorioToken: RepositorioToken,
    private hasheadorContrasena: HasheadorContrasena,
    private hasheadorCodigo: HasheadorCodigo,
  ) {}

  async ejecutar(entrada: DTOReestablecerContrasena): Promise<void> {
    const correoLimpiado = entrada.email.trim().toLowerCase();
    const codigoLimpiado = entrada.code.trim();

    const usuario = await this.repositorioUsuario.buscarPorEmail(correoLimpiado);
    if (!usuario || usuario.id === null) {
      throw new ErrorSolicitudInvalida('Código inválido o vencido, solicita uno nuevo');
    }

    const token = await this.repositorioToken.buscarValidoPorUsuarioYToken(
      usuario.id,
      this.hasheadorCodigo.hashear(codigoLimpiado)
    );
    if (!token || !token.esValido()) {
      throw new ErrorSolicitudInvalida('Código inválido o vencido, solicita uno nuevo');
    }

    usuario.passwordHash = await this.hasheadorContrasena.hashear(entrada.password);
    token.marcarComoUsado();
    await this.repositorioToken.actualizar(token);
    await this.repositorioToken.invalidarTodosPorUsuario(usuario.id);
    await this.repositorioUsuario.actualizar(usuario);
  }
}
