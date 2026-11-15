import { Usuario } from '../../domain/entities/Usuario';
import { NotificacionRepository } from '../../domain/ports/repositories/NotificacionRepository';
import { RepositorioUsuario } from '../../domain/ports/repositories/RepositorioUsuario';
import { UsuarioModeracionRepository } from '../../domain/ports/repositories/UsuarioModeracionRepository';
import { ROLES } from '../../shared/constants/roles';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorProhibido,
} from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: el moderador suspende una cuenta y revoca su acceso. */
export class SuspenderUsuarioUseCase {
  constructor(
    private usuarioRepository: RepositorioUsuario,
    private notificacionRepository: NotificacionRepository,
    private moderacionRepository?: UsuarioModeracionRepository
  ) {}

  async ejecutar(
    usuarioId: number,
    moderadorId: number,
    motivo: string
  ): Promise<Usuario> {
    if (usuarioId === moderadorId) {
      throw new ErrorProhibido('No puedes suspender tu propia cuenta');
    }

    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }
    if (usuario.rolId === ROLES.ADMIN || usuario.rolId === ROLES.MODERADOR) {
      throw new ErrorProhibido(
        'Solo se pueden suspender cuentas de clientes o freelancers'
      );
    }
    if (usuario.estaSuspendido()) {
      throw new ErrorConflicto('La cuenta ya está suspendida');
    }

    usuario.suspender(motivo, moderadorId);
    const actualizado = await this.usuarioRepository.actualizar(usuario);

    // La sanción queda en el historial aunque la cuenta se reactive después.
    if (this.moderacionRepository) {
      await this.moderacionRepository.registrarSancion({
        usuarioId,
        moderadorId,
        tipo: 'suspension',
        motivo,
      });
    }

    await this.notificacionRepository.crear({
      usuarioId,
      tipo: 'cuenta_suspendida',
      titulo: 'Cuenta suspendida',
      mensaje: `Tu cuenta fue suspendida por la plataforma. Motivo: ${motivo}`,
    });

    return actualizado ?? usuario;
  }
}
