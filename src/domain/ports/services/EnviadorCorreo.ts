export interface EnviadorCorreo {
  enviarCorreoVerificacion(destinatario: string, codigo: string): Promise<void>;
  enviarCorreoRecuperacionContrasena(destinatario: string, codigo: string): Promise<void>;
}
