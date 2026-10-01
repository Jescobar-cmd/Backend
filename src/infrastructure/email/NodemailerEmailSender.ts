import nodemailer, { Transporter } from 'nodemailer';
import { EmailSender } from '../../domain/ports/services/EmailSender';

// Adaptador de infraestructura: implementa el puerto EmailSender con Gmail SMTP.
// Recibe el token y arma el link aquí para que el caso de uso no conozca URLs.
export class NodemailerEmailSender implements EmailSender {
  private transporter: Transporter;

  constructor(
    private confirmLinkBase: string = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/confirm?token=`,
    private resetLinkBase: string = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=`,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.confirmLinkBase}${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'FirstGig',
      to,
      subject: 'Confirma tu cuenta en FirstGig',
      html: `<p>Bienvenido a FirstGig. Confirma tu cuenta aquí:</p><p><a href="${link}">${link}</a></p><p>El enlace vence en 24 horas.</p>`,
    });
  }

  async sendPasswordRecoveryEmail(to: string, token: string): Promise<void> {
    const link = `${this.resetLinkBase}${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'FirstGig',
      to,
      subject: 'Recupera tu contraseña en FirstGig',
      html: `<p>Solicitaste recuperar tu contraseña:</p><p><a href="${link}">${link}</a></p><p>El enlace vence en 1 hora. Si no fuiste tú, ignora este correo.</p>`,
    });
  }
}
