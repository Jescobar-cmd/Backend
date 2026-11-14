import {
  DatosPagoPasarela,
  DatosPreferencia,
  PasarelaPago,
  PreferenciaPago,
} from '../../domain/ports/services/PasarelaPago';
import { ErrorServicioNoDisponible } from '../../shared/errors/ErrorAplicacion';

interface RespuestaPreferencia {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
}

interface RespuestaPago {
  id: number | string;
  status: string;
  transaction_amount: number;
  external_reference?: string | null;
}

/**
 * Adaptador real de Mercado Pago (Checkout Pro + Payments API).
 * Solo se instancia cuando MERCADOPAGO_ACCESS_TOKEN está configurado.
 */
export class MercadoPagoPasarela implements PasarelaPago {
  readonly esSimulada = false;

  constructor(
    private readonly tokenAcceso: string,
    private readonly urlApi: string = 'https://api.mercadopago.com'
  ) {}

  private async solicitar<T>(ruta: string, init: RequestInit): Promise<T> {
    let respuesta: Response;
    try {
      respuesta = await fetch(`${this.urlApi}${ruta}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.tokenAcceso}`,
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });
    } catch (error) {
      console.error('[MercadoPago] Fallo de conexión:', error);
      throw new ErrorServicioNoDisponible(
        'No se pudo conectar con la pasarela de pagos'
      );
    }

    if (!respuesta.ok) {
      const cuerpo = await respuesta.text().catch(() => '');
      console.error(
        `[MercadoPago] Error ${respuesta.status} en ${ruta}: ${cuerpo}`
      );
      throw new ErrorServicioNoDisponible(
        'La pasarela de pagos rechazó la operación'
      );
    }

    return (await respuesta.json()) as T;
  }

  async crearPreferencia(datos: DatosPreferencia): Promise<PreferenciaPago> {
    const preferencia = await this.solicitar<RespuestaPreferencia>(
      '/checkout/preferences',
      {
        method: 'POST',
        body: JSON.stringify({
          items: [
            {
              id: String(datos.contratoId),
              title: datos.descripcion,
              quantity: 1,
              currency_id: 'COP',
              unit_price: datos.monto,
            },
          ],
          payer: { email: datos.emailCliente },
          external_reference: String(datos.contratoId),
          notification_url: datos.urlNotificacion,
          back_urls: {
            success: datos.urlRetorno,
            failure: datos.urlRetorno,
            pending: datos.urlRetorno,
          },
          auto_return: 'approved',
        }),
      }
    );

    const initPoint = preferencia.init_point ?? preferencia.sandbox_init_point;
    if (!initPoint) {
      throw new ErrorServicioNoDisponible(
        'Mercado Pago no devolvió una URL de pago'
      );
    }

    return { id: preferencia.id, initPoint };
  }

  async consultarPago(idPago: string): Promise<DatosPagoPasarela> {
    const pago = await this.solicitar<RespuestaPago>(
      `/v1/payments/${encodeURIComponent(idPago)}`,
      { method: 'GET' }
    );

    return {
      id: String(pago.id),
      estado: pago.status,
      monto: Number(pago.transaction_amount),
      referenciaExterna: pago.external_reference ?? null,
    };
  }

  async reembolsar(idPago: string): Promise<void> {
    await this.solicitar<unknown>(
      `/v1/payments/${encodeURIComponent(idPago)}/refunds`,
      { method: 'POST' }
    );
  }
}
