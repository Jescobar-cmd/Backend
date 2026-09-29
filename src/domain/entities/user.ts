export class User {
  id: number | null;
  nombre: string;
  email: string;
  passwordHash: string | null;
  rolId: number; // 2: Freelancer, 3: Cliente
  telefono: string | null;
  cedula: string | null;
  esMayorDeEdad: boolean;
  estado: 'activo' | 'inactivo';
  googleId: string | null;

  constructor(
    id: number | null,
    nombre: string,
    email: string,
    passwordHash: string | null, // Será null si se registra con Google
    rolId: number,
    telefono: string | null = null, // Será null si viene de Google
    cedula: string | null = null,   // Será null si viene de Google
    esMayorDeEdad: boolean = true,
    estado: 'activo' | 'inactivo' = 'inactivo',
    googleId: string | null = null  // Será null si es registro manual
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

  // --- MÉTODOS PARA EL FLUJO DE NEGOCIO ---

  // 1. Se llama cuando el usuario hace clic en el enlace del correo de confirmación
  activarCuenta() {
    this.estado = 'activo';
  }

  // 2. Se usa en el Login para bloquear el paso si el estado sigue siendo 'inactivo'
  esActivo() {
    return this.estado === 'activo';
  }

  // 3. Sirve para saber si la cuenta se creó con Google (útil para no pedirle contraseña)
  esRegistroGoogle() {
    return this.googleId !== null;
  }

  // 4. Se llama en la pantalla intermedia donde el usuario de Google termina de llenar sus datos
  completarDatosFaltantes(telefono: string, cedula: string) {
    this.telefono = telefono;
    this.cedula = cedula;
  }
}