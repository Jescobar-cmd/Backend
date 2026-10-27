import { EnviadorCorreo } from '../../domain/ports/services/EnviadorCorreo';

interface ErrorBrevo {
  message?: string;
  code?: string;
}

// Adaptador de infraestructura: envía por la API HTTP de Brevo (puerto 443).
// Render bloquea la salida SMTP (Gmail), pero el HTTPS sí pasa.
// El puerto EnviadorCorreo no cambia: el dominio ni se entera.
export class EnviadorCorreoBrevo implements EnviadorCorreo {
  private readonly claveApi: string;
  private readonly correoRemitente: string;
  private readonly nombreRemitente: string;
  private readonly baseEnlaceConfirmacion: string;
  private readonly baseEnlaceRestablecimiento: string;

  constructor() {
    const claveApi = process.env.BREVO_API_KEY;
    if (!claveApi) throw new Error('Falta BREVO_API_KEY en el .env');
    this.claveApi = claveApi;
    this.correoRemitente = process.env.EMAIL_FROM ?? process.env.SMTP_FROM ?? 'no-reply@firstgig.com';
    this.nombreRemitente = process.env.EMAIL_FROM_NAME ?? 'FirstGig';
    const urlFrontend = (process.env.FRONTEND_URL ?? 'http://localhost:5173').trim().replace(/\/+$/, '');
    this.baseEnlaceConfirmacion = `${urlFrontend}/confirm?token=`;
    this.baseEnlaceRestablecimiento = `${urlFrontend}/reset-password?token=`;
  }

  private construirHtml(
    titulo: string,
    introduccion: string,
    codigo: string,
    enlace: string,
    vencimiento: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">${titulo}</h2>
        <p style="color: #334155; font-size: 15px;">${introduccion}</p>
        <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 14px; text-align: center; border-radius: 6px; margin: 20px 0;">
          ${codigo}
        </div>
        <p><a href="${enlace}" style="color: #2563eb; word-break: break-all;">${enlace}</a></p>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">${vencimiento}</p>
      </div>
    `;
  }

  private async enviar(destinatario: string, asunto: string, contenidoHtml: string): Promise<void> {
    const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': this.claveApi },
      body: JSON.stringify({
        sender: { email: this.correoRemitente, name: this.nombreRemitente },
        to: [{ email: destinatario }],
        subject: asunto,
        htmlContent: contenidoHtml,
      }),
    });
    if (!respuesta.ok) {
      const cuerpo = (await respuesta.json().catch(() => ({}))) as ErrorBrevo;
      throw new Error(`Brevo rechazó el envío (${respuesta.status}): ${cuerpo.message ?? 'sin detalle'}`);
    }
  }

  async enviarCorreoVerificacion(destinatario: string, codigo: string): Promise<void> {
    const enlace = `${this.baseEnlaceConfirmacion}${encodeURIComponent(codigo)}`;
    await this.enviar(
      destinatario,
      'Confirma tu cuenta en FirstGig',
      this.construirHtml(
        '¡Bienvenido a FirstGig!',
        'Gracias por registrarte. Ingresa el siguiente código de confirmación en la plataforma:',
        codigo,
        enlace,
        'El código vencerá en 15 minutos. Si tú no creaste esta cuenta, ignora este mensaje.',
      ),
    );
  }

  async enviarCorreoRecuperacionContrasena(destinatario: string, codigo: string): Promise<void> {
    const enlace = `${this.baseEnlaceRestablecimiento}${encodeURIComponent(codigo)}`;
    await this.enviar(
      destinatario,
      'Recuperación de contraseña en FirstGig',
      this.construirHtml(
        'Recuperación de contraseña',
        'Has solicitado restablecer tu contraseña. Usa el siguiente código:',
        codigo,
        enlace,
        'El código vencerá en 1 hora. Si no solicitaste este cambio, tu cuenta sigue segura y puedes ignorar este correo.',
      ),
    );
  }
}
