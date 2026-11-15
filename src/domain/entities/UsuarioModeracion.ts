// Vistas de moderación sobre las cuentas de la plataforma.
// Separadas de la entidad Usuario porque exponen datos de contacto,
// suspensión y sanciones que el dominio de autenticación no maneja.

export type EstadoCuenta = 'activo' | 'inactivo' | 'suspendido';

export interface SuspensionUsuario {
  motivo: string | null;
  fecha: Date | null;
  /** Nombre del moderador que aplicó la suspensión. */
  por: string | null;
}

export interface ResumenUsuarioModeracion {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  /** Nombre del rol tal como está en catálogo ('Administrador', 'Freelancer', ...). */
  rol: string;
  estado: EstadoCuenta;
  fotoPerfil: string | null;
  fechaRegistro: Date;
  /** Solo tiene valor mientras la cuenta está suspendida. */
  suspension: SuspensionUsuario | null;
}

export interface Sancion {
  id: number;
  /** 'suspension' | 'reactivacion' */
  tipo: string;
  motivo: string;
  fecha: Date;
  moderador: { id: number; nombre: string } | null;
}

export interface DetalleUsuarioModeracion extends ResumenUsuarioModeracion {
  telefono: string | null;
  cedula: string | null;
  calificacionPromedio: number | null;
  totalContratos: number;
  totalPublicaciones: number;
  sanciones: Sancion[];
}

export interface FiltrosUsuarioModeracion {
  texto?: string;
  rolId?: number;
  estado?: EstadoCuenta;
  page: number;
  limit: number;
}
