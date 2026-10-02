export type UserEstado = 'activo' | 'inactivo';

export class User {
  id: number | null;
  nombre: string;
  email: string;
  passwordHash: string | null;
  rolId: number; // 2: Freelancer, 3: Cliente
  telefono: string | null;
  cedula: string | null;
  esMayorDeEdad: boolean;
  estado: UserEstado;
  googleId: string | null;

  constructor(
    id: number | null,
    nombre: string,
    email: string,
    passwordHash: string | null,
    rolId: number,
    telefono: string | null = null,
    cedula: string | null = null,
    esMayorDeEdad: boolean = true,
    estado: UserEstado = 'inactivo',
    googleId: string | null = null
  ) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.passwordHash = passwordHash;
    this.rolId = rolId;
    this.telefono = telefono;
    this.cedula = cedula;
    this.esMayorDeEdad = esMayorDeEdad;
    this.estado = estado;
    this.googleId = googleId;
  }

  activarCuenta(): void {
    this.estado = 'activo';
  }

  esActivo(): boolean {
    return this.estado === 'activo';
  }

  esRegistroGoogle(): boolean {
    return this.googleId !== null;
  }

  completarDatosFaltantes(telefono: string, cedula: string): void {
    this.telefono = telefono;
    this.cedula = cedula;
  }
}
