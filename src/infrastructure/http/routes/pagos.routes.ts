import { Router } from 'express';
import { PagoController } from '../controllers/PagoController';
import { limitarIntentos } from '../middlewares/limitarIntentos';

// Webhooks de la pasarela -> se monta en /api/pagos
export const pagosRouter = Router();

pagosRouter.post(
  '/webhook',
  limitarIntentos({ ventanaMs: 60_000, maximo: 120 }),
  PagoController.webhook
);
