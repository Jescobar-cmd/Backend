import { Router } from 'express';
import { FeedController } from '../controllers/FeedController';
import { PropuestaController } from '../controllers/PropuestaController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { validar } from '../middlewares/validar';
import { ROLES } from '../../../shared/constants/roles';
import { crearPropuestaSchema } from '../../../application/validators/propuesta.schemas';

// Feed de inicio -> se monta en /api/feed
export const feedRouter = Router();
feedRouter.use(requiereAutenticacion);
feedRouter.get('/', FeedController.obtener);

// Marketplace de ofertas -> se monta en /api/ofertas
export const mercadoRouter = Router();
mercadoRouter.use(requiereAutenticacion);
mercadoRouter.get('/', FeedController.ofertasPublicas);
mercadoRouter.get('/:id', FeedController.ofertaPublica);
mercadoRouter.post(
  '/:id/propuestas',
  requiereRol(ROLES.FREELANCER),
  validar(crearPropuestaSchema),
  PropuestaController.crear
);
