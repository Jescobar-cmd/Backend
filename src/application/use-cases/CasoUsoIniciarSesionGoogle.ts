import { Usuario } from '../../domain/entities/Usuario';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { VerificadorOAuth } from '../../domain/ports/services/VerificadorOAuth';
import { ErrorSolicitudInvalida, ErrorConflicto } from '../../shared/errors/ErrorAplicacion';

export interface EntradaInicioSesionGoogle {
  idToken: string; // lo entrega el botón "Continuar con Google" del frontend
  rolId?: number; // viene del toggle Soy cliente / Soy freelancer
  telefono?: string | null;
  cedula?: string | null;
}

export type ResultadoInicioSesionGoogle =
  | { estado: 'autenticado'; usuario: Usuario }
  | { estado: 'requiere_registro'; usuario: Usuario };

// Entrar o registrarse con Google. Google ya verificó el correo,
// así que estas cuentas no pasan por el código de confirmación.
export class CasoUsoIniciarSesionGoogle {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private verificadorOAuth: VerificadorOAuth,
  ) {}

  async ejecutar(entrada: EntradaInicioSesionGoogle): Promise<ResultadoInicioSesionGoogle> {
    const perfil = await this.verificadorOAuth.verificarIdToken(entrada.idToken);

    // 1. ¿Ya existe cuenta con este Google? Entra directo si está activa.
    const porGoogle = await this.repositorioUsuario.buscarPorGoogleId(perfil.googleId);
    if (porGoogle) {
      if (porGoogle.esActivo()) return { estado: 'autenticado', usuario: porGoogle };
      return { estado: 'requiere_registro', usuario: porGoogle };
    }

    // 2. ¿Existe cuenta de formulario con ese correo? Se enlaza el Google.
    const porEmail = await this.repositorioUsuario.buscarPorEmail(perfil.email);
    if (porEmail) {
      porEmail.googleId = perfil.googleId;
      const vinculado = await this.repositorioUsuario.actualizar(porEmail);
      const usuario = vinculado ?? porEmail;
      if (usuario.esActivo()) return { estado: 'autenticado', usuario };
      return { estado: 'requiere_registro', usuario };
    }

    // 3. Cuenta nueva: se crea activa porque Google ya validó el email.
    const rolId = entrada.rolId === 2 ? 2 : 3;
    const cedula = entrada.cedula?.trim() ? entrada.cedula.trim() : null;
    const telefono = entrada.telefono?.trim() ? entrada.telefono.trim() : null;

    if (rolId === 2 && !cedula) {
      throw new ErrorSolicitudInvalida('La cédula es obligatoria para freelancers');
    }

    if (cedula) {
      const cedulaExistente = await this.repositorioUsuario.buscarPorCedula(cedula);
      if (cedulaExistente) {
        throw new ErrorConflicto('La cédula ya se encuentra registrada con otra cuenta');
      }
    }

    const creado = await this.repositorioUsuario.guardar(
      new Usuario(
        null,
        perfil.nombre,
        perfil.email,
        null, // sin contraseña: entra siempre con Google
        rolId,
        telefono,
        cedula,
        true,
        'activo',
        perfil.googleId,
      ),
    );

    return { estado: 'autenticado', usuario: creado };
  }
}
