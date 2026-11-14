import crypto from 'crypto';
import { ErrorNoAutorizado } from '../../shared/errors/ErrorAplicacion';

export interface ParametrosFirmaWebhook {
  idPago: string;
  firma?: string | string[];
  requestId?: string | string[];
  secreto?: string;
}

/**
 * Validador criptográfico de la firma HMAC-SHA256 enviada por los webhooks de Mercado Pago.
 * Cumple con el estándar de seguridad de Mercado Pago y previene ataques de temporización (timing attacks).
 */
export function verificarFirmaWebhookMercadoPago({
  idPago,
  firma,
  requestId,
  secreto,
}: ParametrosFirmaWebhook): void {
  if (!secreto) {
    // Modo desarrollo / pruebas sin secreto configurado
    return;
  }

  if (typeof firma !== 'string' || typeof requestId !== 'string') {
    throw new ErrorNoAutorizado('Webhook sin firma');
  }

  const partes = Object.fromEntries(
    firma.split(',').map((parte) => {
      const [clave, valor] = parte.split('=');
      return [clave?.trim(), valor?.trim()];
    })
  ) as Record<string, string>;

  if (!partes.ts || !partes.v1) {
    throw new ErrorNoAutorizado('Webhook con firma inválida');
  }

  const manifiesto = `id:${idPago};request-id:${requestId};ts:${partes.ts};`;
  const esperado = crypto
    .createHmac('sha256', secreto)
    .update(manifiesto)
    .digest('hex');

  const recibido = Buffer.from(partes.v1);
  const calculado = Buffer.from(esperado);

  if (
    recibido.length !== calculado.length ||
    !crypto.timingSafeEqual(recibido, calculado)
  ) {
    throw new ErrorNoAutorizado('Firma del webhook inválida');
  }
}
