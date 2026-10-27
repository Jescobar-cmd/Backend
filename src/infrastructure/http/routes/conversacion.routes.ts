import { Router } from 'express';
import { ConversacionController } from '../controllers/ConversacionController';
import { OfertaChatController } from '../controllers/OfertaChatController';
import { requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import {
  crearConversacionSchema,
  enviarMensajeSchema,
} from '../../../application/validators/conversacion.schemas';
import { crearOfertaChatSchema } from '../../../application/validators/ofertaChat.schemas';

// Chat (polling) -> se monta en /api/conversaciones
export const conversacionesRouter = Router();
conversacionesRouter.use(requireAuth);

conversacionesRouter.post('/', validate(crearConversacionSchema), ConversacionController.crear);
conversacionesRouter.get('/', ConversacionController.listar);
conversacionesRouter.get('/:id', ConversacionController.detalle);
conversacionesRouter.get('/:id/mensajes', ConversacionController.mensajes);
conversacionesRouter.post(
  '/:id/mensajes',
  validate(enviarMensajeSchema),
  ConversacionController.enviar
);
conversacionesRouter.post(
  '/:id/ofertas',
  validate(crearOfertaChatSchema),
  OfertaChatController.crear
);
conversacionesRouter.patch('/:id/leido', ConversacionController.marcarLeido);
