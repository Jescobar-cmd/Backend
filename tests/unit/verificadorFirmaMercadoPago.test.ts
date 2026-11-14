import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import { verificarFirmaWebhookMercadoPago } from '../../src/infrastructure/pagos/verificadorFirmaMercadoPago';
import { ErrorNoAutorizado } from '../../src/shared/errors/ErrorAplicacion';

describe('verificarFirmaWebhookMercadoPago', () => {
  const secreto = 'secreto-webhook-prueba';
  const idPago = '123456789';
  const requestId = 'req-abc-123';
  const ts = '1710000000';

  function generarFirma(id: string, reqId: string, timestamp: string, claveSecreta: string): string {
    const manifiesto = `id:${id};request-id:${reqId};ts:${timestamp};`;
    const v1 = crypto.createHmac('sha256', claveSecreta).update(manifiesto).digest('hex');
    return `ts=${timestamp},v1=${v1}`;
  }

  it('no valida cuando no hay secreto configurado (entorno de pruebas/desarrollo)', () => {
    expect(() =>
      verificarFirmaWebhookMercadoPago({
        idPago,
        firma: undefined,
        requestId: undefined,
        secreto: undefined,
      })
    ).not.toThrow();
  });

  it('valida exitosamente cuando la firma y el requestId coinciden', () => {
    const firmaValida = generarFirma(idPago, requestId, ts, secreto);

    expect(() =>
      verificarFirmaWebhookMercadoPago({
        idPago,
        firma: firmaValida,
        requestId,
        secreto,
      })
    ).not.toThrow();
  });

  it('lanza ErrorNoAutorizado si faltan las cabeceras requeridas', () => {
    expect(() =>
      verificarFirmaWebhookMercadoPago({
        idPago,
        firma: undefined,
        requestId,
        secreto,
      })
    ).toThrow(ErrorNoAutorizado);

    expect(() =>
      verificarFirmaWebhookMercadoPago({
        idPago,
        firma: 'ts=123,v1=abc',
        requestId: undefined,
        secreto,
      })
    ).toThrow(ErrorNoAutorizado);
  });

  it('lanza ErrorNoAutorizado si la firma está manipulada o el secreto no coincide', () => {
    const firmaInvalida = generarFirma(idPago, requestId, ts, 'otro-secreto');

    expect(() =>
      verificarFirmaWebhookMercadoPago({
        idPago,
        firma: firmaInvalida,
        requestId,
        secreto,
      })
    ).toThrow(ErrorNoAutorizado);
  });
});
