import { Usuario } from '../../domain/entities/Usuario';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { VerificadorOAuth } from '../../domain/ports/services/VerificadorOAuth';
import { ErrorSolicitudInvalida, ErrorConflicto, ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

export interface EntradaCompletarPerfilGoogle {
  idToken: string; // se vuelve a pedir para comprobar que es el dueño de la cuenta
  rolId: number; // 2: Freelancer, 3: Cliente
  telefono?: string | null;
  cedula?: string | null;
}

// Pantallita intermedia: el usuario de Google que quedó pendiente
// completa rol + cédula + teléfono y su cuenta se activa.
export class CasoUsoCompletarPerfilGoogle {
  constructor(
    private repositorioUsuario: RepositorioUsuario,
    private verificadorOAuth: VerificadorOAuth,
  ) {}

  async ejecutar(entrada: EntradaCompletarPerfilGoogle): Promise<Usuario> {
    const perfil = await this.verificadorOAuth.verificarIdToken(entrada.idToken);
    const usuario = await this.repositorioUsuario.buscarPorGoogleId(perfil.googleId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Cuenta de Google no encontrada');
    }
    if (usuario.esActivo()) {
      throw new ErrorSolicitudInvalida('Tu cuenta ya está activa');
    }

    const rolId = entrada.rolId === 2 ? 2 : 3;
    const cedula = entrada.cedula?.trim() ? entrada.cedula.trim() : null;
    const telefono = entrada.telefono?.trim() ? entrada.telefono.trim() : null;

    if (rolId === 2 && !cedula) {
      throw new ErrorSolicitudInvalida('La cédula es obligatoria para freelancers');
    }

    if (cedula) {
      const cedulaExistente = await this.repositorioUsuario.buscarPorCedula(cedula);
      if (cedulaExistente && cedulaExistente.id !== usuario.id) {
        throw new ErrorConflicto('La cédula ya se encuentra registrada con otra cuenta');
      }
    }

    usuario.rolId = rolId;
    usuario.telefono = telefono;
    usuario.cedula = cedula;
    usuario.activarCuenta();

    const actualizado = await this.repositorioUsuario.actualizar(usuario);
    return actualizado ?? usuario;
  }
}
