export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido';

export interface PropsUsuario {
  id?: number | null;
  nombre: string;
  email: string;
  passwordHash?: string | null;
  rolId: number; // ROLES: 1: Admin, 2: Freelancer, 3: Cliente, 4: Moderador
  telefono?: string | null;
  cedula?: string | null;
  esMayorDeEdad?: boolean;
  estado?: EstadoUsuario;
  googleId?: string | null;
  motivoSuspension?: string | null;
  suspendidoPorId?: number | null;
  fechaSuspension?: Date | null;
}

export class Usuario {
  id: number | null;
  nombre: string;
  email: string;
  passwordHash: string | null;
  rolId: number;
  telefono: string | null;
  cedula: string | null;
  esMayorDeEdad: boolean;
  estado: EstadoUsuario;
  googleId: string | null;
  motivoSuspension: string | null;
  suspendidoPorId: number | null;
  fechaSuspension: Date | null;

  constructor(
    idOrProps: number | null | PropsUsuario,
    nombre?: string,
    email?: string,
    passwordHash: string | null = null,
    rolId: number = 3,
    telefono: string | null = null,
    cedula: string | null = null,
    esMayorDeEdad: boolean = true,
    estado: EstadoUsuario = 'inactivo',
    googleId: string | null = null,
    motivoSuspension: string | null = null,
    suspendidoPorId: number | null = null,
    fechaSuspension: Date | null = null
  ) {
    if (typeof idOrProps === 'object' && idOrProps !== null) {
      const props = idOrProps;
      this.id = props.id ?? null;
      this.nombre = props.nombre;
      this.email = props.email;
      this.passwordHash = props.passwordHash ?? null;
      this.rolId = props.rolId;
      this.telefono = props.telefono ?? null;
      this.cedula = props.cedula ?? null;
      this.esMayorDeEdad = props.esMayorDeEdad ?? true;
      this.estado = props.estado ?? 'inactivo';
      this.googleId = props.googleId ?? null;
      this.motivoSuspension = props.motivoSuspension ?? null;
      this.suspendidoPorId = props.suspendidoPorId ?? null;
      this.fechaSuspension = props.fechaSuspension ?? null;
    } else {
      this.id = idOrProps;
      this.nombre = nombre!;
      this.email = email!;
      this.passwordHash = passwordHash;
      this.rolId = rolId;
      this.telefono = telefono;
      this.cedula = cedula;
      this.esMayorDeEdad = esMayorDeEdad;
      this.estado = estado;
      this.googleId = googleId;
      this.motivoSuspension = motivoSuspension;
      this.suspendidoPorId = suspendidoPorId;
      this.fechaSuspension = fechaSuspension;
    }
  }

  static crear(props: PropsUsuario): Usuario {
    return new Usuario(props);
  }

  activarCuenta(): void {
    this.estado = 'activo';
  }

  esActivo(): boolean {
    return this.estado === 'activo';
  }

  estaSuspendido(): boolean {
    return this.estado === 'suspendido';
  }

  suspender(motivo?: string | null, moderadorId?: number | null): void {
    this.estado = 'suspendido';
    this.motivoSuspension = motivo ?? null;
    this.suspendidoPorId = moderadorId ?? null;
    this.fechaSuspension = new Date();
  }

  reactivar(): void {
    this.estado = 'activo';
    this.motivoSuspension = null;
    this.suspendidoPorId = null;
    this.fechaSuspension = null;
  }

  esRegistroGoogle(): boolean {
    return this.googleId !== null;
  }

  completarDatosFaltantes(telefono: string, cedula: string): void {
    this.telefono = telefono;
    this.cedula = cedula;
  }
}
