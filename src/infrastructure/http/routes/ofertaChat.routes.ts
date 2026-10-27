import { Router } from 'express';
import { OfertaChatController } from '../controllers/OfertaChatController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { validar } from '../middlewares/validar';
import { contraofertaSchema } from '../../../application/validators/ofertaChat.schemas';

// Acciones sobre ofertas de chat -> se monta en /api/ofertas-chat
export const ofertaChatRouter = Router();
ofertaChatRouter.use(requiereAutenticacion);

ofertaChatRouter.post('/:id/aceptar', OfertaChatController.aceptar);
ofertaChatRouter.post('/:id/rechazar', OfertaChatController.rechazar);
ofertaChatRouter.post(
  '/:id/contraoferta',
  validar(contraofertaSchema),
  OfertaChatController.contraofertar
);
