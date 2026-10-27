import { Usuario } from '../../domain/entities/Usuario';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { RepositorioToken } from '../../domain/ports/repositories/RepositorioToken';
import { ErrorSolicitudInvalida } from '../../shared/errors/ErrorAplicacion';

export interface DTOConfirmarCodigo {
  email: string;
  code: string;
}

export class CasoUsoConfirmarCodigo {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private repositorioToken: RepositorioToken,
  ) {}

  async ejecutar(dto: DTOConfirmarCodigo): Promise<Usuario> {
    const correo = dto.email.trim().toLowerCase();
    const codigo = dto.code.trim();

    const usuario = await this.repositorioUsuario.buscarPorEmail(correo);
    if (!usuario || usuario.id === null) {
      throw new ErrorSolicitudInvalida('Código inválido o vencido, solicita uno nuevo');
    }

    if (usuario.esActivo()) {
      return usuario;
    }

    const token = await this.repositorioToken.buscarValidoPorUsuarioYToken(usuario.id, codigo);
    if (!token || !token.esValido()) {
      throw new ErrorSolicitudInvalida('Código inválido o vencido, solicita uno nuevo');
    }

    usuario.activarCuenta();
    token.marcarComoUsado();
    await this.repositorioToken.actualizar(token);
    await this.repositorioToken.invalidarTodosPorUsuario(usuario.id);

    const actualizado = await this.repositorioUsuario.actualizar(usuario);
    return actualizado ?? usuario;
  }
}
