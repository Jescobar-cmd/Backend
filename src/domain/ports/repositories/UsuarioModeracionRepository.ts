import {
  DetalleUsuarioModeracion,
  FiltrosUsuarioModeracion,
  ResumenUsuarioModeracion,
} from '../../entities/UsuarioModeracion';

/**
 * Puerto de solo lectura para el panel de moderación de usuarios.
 * Expone datos de contacto, suspensión y sanciones que la entidad
 * Usuario (dominio de autenticación) no necesita.
 */
export interface UsuarioModeracionRepository {
  listar(
    filtros: FiltrosUsuarioModeracion
  ): Promise<{ items: ResumenUsuarioModeracion[]; total: number }>;

  obtenerDetalle(id: number): Promise<DetalleUsuarioModeracion | null>;

  /** Registra una sanción (suspensión o reactivación) en el historial. */
  registrarSancion(datos: {
    usuarioId: number;
    moderadorId: number;
    tipo: string;
    motivo: string;
  }): Promise<void>;
}
