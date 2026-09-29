export class RecoveryToken {
  id: number | null;
  usuarioId: number;       // A qué usuario le pertenece este ticket
  token: string;           // El código único (ej: "abc123xyz")
  fechaExpiracion: Date;   // Hasta cuándo sirve (ej: 15 minutos desde que se pide)
  usado: boolean;          // Para saber si ya lo quemaron

  constructor(
    id: number | null,
    usuarioId: number,
    token: string,
    fechaExpiracion: Date,
    usado: boolean = false
  ) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.token = token;
    this.fechaExpiracion = fechaExpiracion;
    this.usado = usado;
  }

  // --- MÉTODOS PARA EL FLUJO DE NEGOCIO ---

  // 1. Verifica si el ticket aún sirve (no lo han usado y no se ha vencido)
  esValido(): boolean {
    const ahora = new Date();
    return this.usado === false && this.fechaExpiracion > ahora;
  }

  // 2. Quema el ticket tan pronto el usuario cambia la clave exitosamente
  marcarComoUsado() {
    this.usado = true;
  }
}