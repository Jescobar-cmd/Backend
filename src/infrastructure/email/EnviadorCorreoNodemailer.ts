import nodemailer, { Transporter } from 'nodemailer';
import { EnviadorCorreo } from '../../domain/ports/services/EnviadorCorreo';
import { ErrorInternoServidor } from '../../shared/errors/ErrorAplicacion';
import { entorno } from '../../config/entorno';

export class EnviadorCorreoNodemailer implements EnviadorCorreo {
  private transportador: Transporter;
  private readonly baseEnlaceConfirmacion: string;
  private readonly baseEnlaceRestablecimiento: string;
  private readonly remitente: string;

  constructor() {
    const urlFrontend = entorno.FRONTEND_URL.trim().replace(/\/+$/, '');
    this.baseEnlaceConfirmacion = `${urlFrontend}/confirm?token=`;
    this.baseEnlaceRestablecimiento = `${urlFrontend}/reset-password?token=`;
    this.remitente = entorno.SMTP_FROM;

    const puerto = entorno.SMTP_PORT;
    this.transportador = nodemailer.createTransport({
      host: entorno.SMTP_HOST,
      port: puerto,
      secure: puerto === 465,
      auth: {
        user: entorno.SMTP_USER,
        pass: entorno.SMTP_PASS,
      },
    });
  }

  async enviarCorreoVerificacion(destinatario: string, codigo: string): Promise<void> {
    const enlace = `${this.baseEnlaceConfirmacion}${encodeURIComponent(codigo)}`;

    try {
      await this.transportador.sendMail({
        from: this.remitente,
        to: destinatario,
        subject: 'Confirma tu cuenta en FirstGig',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">¡Bienvenido a FirstGig!</h2>
            <p style="color: #334155; font-size: 15px;">Gracias por registrarte. Ingresa el siguiente código de confirmación en la plataforma:</p>
            <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 14px; text-align: center; border-radius: 6px; margin: 20px 0;">
              ${codigo}
            </div>
            <p style="color: #334155; font-size: 14px;">O si prefieres, confirma directamente haciendo clic en el enlace:</p>
            <p><a href="${enlace}" style="color: #2563eb; word-break: break-all;">${enlace}</a></p>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px;">El código vencerá en 15 minutos. Si tú no creaste esta cuenta, ignora este mensaje.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('[EnviadorCorreoNodemailer] Fallo al enviar correo:', error);
      throw new ErrorInternoServidor('No se pudo enviar el correo de verificación en este momento');
    }
  }

  async enviarCorreoRecuperacionContrasena(destinatario: string, codigo: string): Promise<void> {
    const enlace = `${this.baseEnlaceRestablecimiento}${encodeURIComponent(codigo)}`;

    try {
      await this.transportador.sendMail({
        from: this.remitente,
        to: destinatario,
        subject: 'Recuperación de contraseña en FirstGig',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">Recuperación de contraseña</h2>
            <p style="color: #334155; font-size: 15px;">Has solicitado restablecer tu contraseña. Usa el siguiente código:</p>
            <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 14px; text-align: center; border-radius: 6px; margin: 20px 0;">
              ${codigo}
            </div>
            <p style="color: #334155; font-size: 14px;">O restablece directamente tu contraseña en el siguiente enlace:</p>
            <p><a href="${enlace}" style="color: #2563eb; word-break: break-all;">${enlace}</a></p>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px;">El código vencerá en 1 hora. Si no solicitaste este cambio, tu cuenta sigue segura y puedes ignorar este correo.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('[EnviadorCorreoNodemailer] Fallo al enviar correo:', error);
      throw new ErrorInternoServidor('No se pudo enviar el correo de recuperación en este momento');
    }
  }
}
