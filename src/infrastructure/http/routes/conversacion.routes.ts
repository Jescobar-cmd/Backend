import { Router } from 'express';
import { ConversacionController } from '../controllers/ConversacionController';
import { requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import {
  crearConversacionSchema,
  enviarMensajeSchema,
} from '../../../application/validators/conversacion.schemas';

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
conversacionesRouter.patch('/:id/leido', ConversacionController.marcarLeido);
