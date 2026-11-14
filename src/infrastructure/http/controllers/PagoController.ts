import { Response, NextFunction } from 'express';
import { contenedor } from '../contenedor';
import { SolicitudAutenticada } from '../middlewares/middlewareAutenticacion';
import { obtenerUsuarioId, parsearIdParam } from '../helpers/peticion.helper';
import { entorno } from '../../../config/entorno';
import { ErrorSolicitudInvalida } from '../../../shared/errors/ErrorAplicacion';
import { verificarFirmaWebhookMercadoPago } from '../../pagos/verificadorFirmaMercadoPago';

interface CuerpoWebhook {
  type?: string;
  action?: string;
  data?: { id?: string | number };
  id?: string | number;
}

export class PagoController {
  /** POST /api/contratos/:id/pago/preferencia */
  static async iniciar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const preferencia = await contenedor.iniciarPago.ejecutar(
        contratoId,
        clienteId
      );
      res.status(201).json(preferencia);
    } catch (e) {
      next(e);
    }
  }

  /** GET /api/contratos/:id/pago */
  static async consultar(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const pago = await contenedor.consultarPagoContrato.ejecutar(
        contratoId,
        usuarioId
      );
      res.json({ pago });
    } catch (e) {
      next(e);
    }
  }

  /** POST /api/contratos/:id/pago/simular (solo desarrollo/pruebas) */
  static async simular(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clienteId = obtenerUsuarioId(req);
      const contratoId = parsearIdParam(req.params.id, 'contrato');
      const pago = await contenedor.simularPago.ejecutar(contratoId, clienteId);
      res.json({
        mensaje: 'Pago simulado confirmado y retenido en escrow',
        pago,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/pagos/webhook
   * Mercado Pago notifica aquí. Se valida la firma HMAC si está configurada
   * y luego se concilia el pago consultando la API (nunca se confía en el body).
   */
  static async webhook(
    req: SolicitudAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cuerpo = (req.body ?? {}) as CuerpoWebhook;
      const tipo = cuerpo.type ?? String(req.query.type ?? '');
      const idPago =
        cuerpo.data?.id ??
        cuerpo.id ??
        req.query['data.id'] ??
        req.query.id;

      if (tipo && tipo !== 'payment') {
        res.json({ received: true });
        return;
      }
      if (!idPago) {
        throw new ErrorSolicitudInvalida('Webhook sin identificador de pago');
      }

      verificarFirmaWebhookMercadoPago({
        idPago: String(idPago),
        firma: req.headers['x-signature'],
        requestId: req.headers['x-request-id'],
        secreto: entorno.MERCADOPAGO_WEBHOOK_SECRET,
      });

      await contenedor.confirmarPago.ejecutar(String(idPago));
      res.json({ received: true });
    } catch (e) {
      next(e);
    }
  }
}
