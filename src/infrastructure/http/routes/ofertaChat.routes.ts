import { Router } from 'express';
import { OfertaChatController } from '../controllers/OfertaChatController';
import { requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { contraofertaSchema } from '../../../application/validators/ofertaChat.schemas';

// Acciones sobre ofertas de chat -> se monta en /api/ofertas-chat
export const ofertaChatRouter = Router();
ofertaChatRouter.use(requireAuth);

ofertaChatRouter.post('/:id/aceptar', OfertaChatController.aceptar);
ofertaChatRouter.post('/:id/rechazar', OfertaChatController.rechazar);
ofertaChatRouter.post(
  '/:id/contraoferta',
  validate(contraofertaSchema),
  OfertaChatController.contraofertar
);
