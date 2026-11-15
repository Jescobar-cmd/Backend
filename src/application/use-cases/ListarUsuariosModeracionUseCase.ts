import { UsuarioModeracionRepository } from '../../domain/ports/repositories/UsuarioModeracionRepository';
import {
  FiltrosUsuarioModeracion,
  ResumenUsuarioModeracion,
} from '../../domain/entities/UsuarioModeracion';

export interface UsuariosModeracionPaginados {
  page: number;
  limit: number;
  total: number;
  items: ResumenUsuarioModeracion[];
}

/** Caso de uso: lista usuarios con filtros para el panel de moderación. */
export class ListarUsuariosModeracionUseCase {
  constructor(private usuarios: UsuarioModeracionRepository) {}

  async ejecutar(
    filtros: FiltrosUsuarioModeracion
  ): Promise<UsuariosModeracionPaginados> {
    const { page, limit, ...resto } = filtros;
    const resultado = await this.usuarios.listar({ ...resto, page, limit });
    return { page, limit, total: resultado.total, items: resultado.items };
  }
}
