import { Usuario } from '../../domain/entities/Usuario';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { HasheadorContrasena } from '../../domain/ports/services/HasheadorContrasena';
import { ErrorNoAutorizado } from '../../shared/errors/ErrorAplicacion';

export interface DTOInicioSesion {
  email: string;
  password: string;
}

export class CasoUsoIniciarSesion {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private hasheadorContrasena: HasheadorContrasena,
  ) {}

  async ejecutar(dto: DTOInicioSesion): Promise<Usuario> {
    const correo = dto.email.trim().toLowerCase();
    const usuario = await this.repositorioUsuario.buscarPorEmail(correo);

    if (!usuario) {
      throw new ErrorNoAutorizado('Correo o contraseña incorrectos');
    }

    if (!usuario.passwordHash) {
      if (usuario.esRegistroGoogle()) {
        throw new ErrorNoAutorizado('Esta cuenta fue registrada con Google. Inicia sesión con el botón de Google.');
      }
      throw new ErrorNoAutorizado('Correo o contraseña incorrectos');
    }

    const esContrasenaValida = await this.hasheadorContrasena.comparar(dto.password, usuario.passwordHash);
    if (!esContrasenaValida) {
      throw new ErrorNoAutorizado('Correo o contraseña incorrectos');
    }

    if (!usuario.esActivo()) {
      throw new ErrorNoAutorizado('Confirma tu cuenta antes de iniciar sesión. Revisa tu correo electrónico.');
    }

    return usuario;
  }
}
