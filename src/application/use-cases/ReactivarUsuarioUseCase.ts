import { Usuario } from '../../domain/entities/Usuario';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el moderador reactiva una cuenta suspendida. */
export class ReactivarUsuarioUseCase {
  constructor(
    private usuarioRepository: RepositorioUsuario,
    private notificacionRepository: NotificacionRepository
  ) {}

  async ejecutar(usuarioId: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }
    if (!usuario.estaSuspendido()) {
      throw new ErrorConflicto('La cuenta no está suspendida');
    }

    usuario.reactivar();
    const actualizado = await this.usuarioRepository.actualizar(usuario);

    await this.notificacionRepository.crear({
      usuarioId,
      tipo: 'cuenta_reactivada',
      titulo: 'Cuenta reactivada',
      mensaje: 'Tu cuenta fue reactivada. Ya puedes iniciar sesión de nuevo.',
    });

    return actualizado ?? usuario;
  }
}
