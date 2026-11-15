import { UsuarioModeracionRepository } from '../../domain/ports/repositories/UsuarioModeracionRepository';
import { DetalleUsuarioModeracion } from '../../domain/entities/UsuarioModeracion';
import { ErrorNoEncontrado } from '../../shared/errors/ErrorAplicacion';

/** Caso de uso: ficha de moderación de un usuario con sanciones y actividad. */
export class ObtenerUsuarioModeracionUseCase {
  constructor(private usuarios: UsuarioModeracionRepository) {}

  async ejecutar(id: number): Promise<DetalleUsuarioModeracion> {
    const usuario = await this.usuarios.obtenerDetalle(id);
    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado');
    }
    return usuario;
  }
}
