import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { HasheadorContrasena } from '../../domain/ports/services/HasheadorContrasena';
import { ErrorSolicitudInvalida, ErrorNoEncontrado, ErrorNoAutorizado } from '../../shared/errors/ErrorAplicacion';

// Cambiar la clave con sesión iniciada (perfil -> cambiar contraseña).
export class CasoUsoCambiarContrasena {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private hasheadorContrasena: HasheadorContrasena,
  ) {}

  async ejecutar(entrada: {
    usuarioId: number;
    contrasenaActual: string;
    contrasenaNueva: string;
  }): Promise<void> {
    if (entrada.contrasenaNueva.length < 8) {
      throw new ErrorSolicitudInvalida('La nueva contraseña debe tener mínimo 8 caracteres');
    }

    const usuario = await this.repositorioUsuario.buscarPorId(entrada.usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }

    if (!usuario.passwordHash) {
      throw new ErrorSolicitudInvalida('Tu cuenta fue creada con Google, no tiene contraseña que cambiar');
    }

    const coincide = await this.hasheadorContrasena.comparar(
      entrada.contrasenaActual,
      usuario.passwordHash
    );
    if (!coincide) {
      throw new ErrorNoAutorizado('La contraseña actual es incorrecta');
    }

    usuario.passwordHash = await this.hasheadorContrasena.hashear(entrada.contrasenaNueva);
    await this.repositorioUsuario.actualizar(usuario);
  }
}
