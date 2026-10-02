export class RecoveryToken {
  id: number | null;
  usuarioId: number;
  token: string;
  fechaExpiracion: Date;
  usado: boolean;

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

  esValido(): boolean {
    const ahora = new Date();
    return !this.usado && this.fechaExpiracion.getTime() > ahora.getTime();
  }

  marcarComoUsado(): void {
    this.usado = true;
  }
}