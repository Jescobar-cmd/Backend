import nodemailer, { Transporter } from 'nodemailer';
import { EmailSender } from '../../domain/ports/services/EmailSender';

export class NodemailerEmailSender implements EmailSender {
  private transporter: Transporter;
  private readonly confirmLinkBase: string;
  private readonly resetLinkBase: string;

  constructor() {
    const rawFrontend = (process.env.FRONTEND_URL ?? 'http://localhost:5173').trim().replace(/\/+$/, '');
    this.confirmLinkBase = `${rawFrontend}/confirm?token=`;
    this.resetLinkBase = `${rawFrontend}/reset-password?token=`;

    const port = Number(process.env.SMTP_PORT ?? 587);
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.confirmLinkBase}${encodeURIComponent(token)}`;
    const from = process.env.SMTP_FROM ?? 'FirstGig <no-reply@firstgig.com>';

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Confirma tu cuenta en FirstGig',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">¡Bienvenido a FirstGig!</h2>
          <p style="color: #334155; font-size: 15px;">Gracias por registrarte. Ingresa el siguiente código de confirmación en la plataforma:</p>
          <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 14px; text-align: center; border-radius: 6px; margin: 20px 0;">
            ${token}
          </div>
          <p style="color: #334155; font-size: 14px;">O si prefieres, confirma directamente haciendo clic en el enlace:</p>
          <p><a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a></p>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">El código vencerá en 15 minutos. Si tú no creaste esta cuenta, ignora este mensaje.</p>
        </div>
      `,
    });
  }

  async sendPasswordRecoveryEmail(to: string, token: string): Promise<void> {
    const link = `${this.resetLinkBase}${encodeURIComponent(token)}`;
    const from = process.env.SMTP_FROM ?? 'FirstGig <no-reply@firstgig.com>';

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Recuperación de contraseña en FirstGig',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Recuperación de contraseña</h2>
          <p style="color: #334155; font-size: 15px;">Has solicitado restablecer tu contraseña. Usa el siguiente código:</p>
          <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 14px; text-align: center; border-radius: 6px; margin: 20px 0;">
            ${token}
          </div>
          <p style="color: #334155; font-size: 14px;">O restablece directamente tu contraseña en el siguiente enlace:</p>
          <p><a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a></p>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">El código vencerá en 1 hora. Si no solicitaste este cambio, tu cuenta sigue segura y puedes ignorar este correo.</p>
        </div>
      `,
    });
  }
}
