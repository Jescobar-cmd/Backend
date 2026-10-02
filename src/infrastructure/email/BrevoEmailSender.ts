import { EmailSender } from '../../domain/ports/services/EmailSender';

interface BrevoError {
  message?: string;
  code?: string;
}

// Adaptador de infraestructura: envía por la API HTTP de Brevo (puerto 443).
// Render bloquea la salida SMTP (Gmail), pero el HTTPS sí pasa.
// El puerto EmailSender no cambia: el dominio ni se entera.
export class BrevoEmailSender implements EmailSender {
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly confirmLinkBase: string;
  private readonly resetLinkBase: string;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) throw new Error('Falta BREVO_API_KEY en el .env');
    this.apiKey = apiKey;
    // Debe ser un remitente VERIFICADO en Brevo (puede ser tu Gmail, no exige dominio propio)
    this.fromEmail = process.env.EMAIL_FROM ?? 'fended25@gmail.com';
    this.fromName = process.env.EMAIL_FROM_NAME ?? 'FirstGig';
    const rawFrontend = (process.env.FRONTEND_URL ?? 'http://localhost:5173').trim().replace(/\/+$/, '');
    this.confirmLinkBase = `${rawFrontend}/confirm?token=`;
    this.resetLinkBase = `${rawFrontend}/reset-password?token=`;
  }

  private buildHtml(title: string, intro: string, token: string, link: string, expiry: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
        <p style="color: #334155; font-size: 15px;">${intro}</p>
        <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 14px; text-align: center; border-radius: 6px; margin: 20px 0;">
          ${token}
        </div>
        <p><a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a></p>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">${expiry}</p>
      </div>
    `;
  }

  private async send(to: string, subject: string, htmlContent: string): Promise<void> {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': this.apiKey },
      body: JSON.stringify({
        sender: { email: this.fromEmail, name: this.fromName },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as BrevoError;
      throw new Error(`Brevo rechazó el envío (${res.status}): ${body.message ?? 'sin detalle'}`);
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.confirmLinkBase}${encodeURIComponent(token)}`;
    await this.send(
      to,
      'Confirma tu cuenta en FirstGig',
      this.buildHtml(
        '¡Bienvenido a FirstGig!',
        'Gracias por registrarte. Ingresa el siguiente código de confirmación en la plataforma:',
        token,
        link,
        'El código vencerá en 15 minutos. Si tú no creaste esta cuenta, ignora este mensaje.',
      ),
    );
  }

  async sendPasswordRecoveryEmail(to: string, token: string): Promise<void> {
    const link = `${this.resetLinkBase}${encodeURIComponent(token)}`;
    await this.send(
      to,
      'Recuperación de contraseña en FirstGig',
      this.buildHtml(
        'Recuperación de contraseña',
        'Has solicitado restablecer tu contraseña. Usa el siguiente código:',
        token,
        link,
        'El código vencerá en 1 hora. Si no solicitaste este cambio, tu cuenta sigue segura y puedes ignorar este correo.',
      ),
    );
  }
}
