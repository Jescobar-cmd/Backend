import { Router } from 'express';
import { ConversacionController } from '../controllers/ConversacionController';
import { OfertaChatController } from '../controllers/OfertaChatController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { validar } from '../middlewares/validar';
import {
  crearConversacionSchema,
  enviarMensajeSchema,
} from '../../../application/validators/conversacion.schemas';
import { crearOfertaChatSchema } from '../../../application/validators/ofertaChat.schemas';

// Chat (polling) -> se monta en /api/conversaciones
export const conversacionesRouter = Router();
conversacionesRouter.use(requiereAutenticacion);

conversacionesRouter.post('/', validar(crearConversacionSchema), ConversacionController.crear);
conversacionesRouter.get('/', ConversacionController.listar);
conversacionesRouter.get('/:id', ConversacionController.detalle);
conversacionesRouter.get('/:id/mensajes', ConversacionController.mensajes);
conversacionesRouter.post(
  '/:id/mensajes',
  validar(enviarMensajeSchema),
  ConversacionController.enviar
);
conversacionesRouter.post(
  '/:id/ofertas',
  validar(crearOfertaChatSchema),
  OfertaChatController.crear
);
conversacionesRouter.patch('/:id/leido', ConversacionController.marcarLeido);
