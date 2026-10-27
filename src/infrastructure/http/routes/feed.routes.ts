import { Router } from 'express';
import { FeedController } from '../controllers/FeedController';
import { PropuestaController } from '../controllers/PropuestaController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { ROLES } from '../../../shared/constants/roles';
import { crearPropuestaSchema } from '../../../application/validators/propuesta.schemas';

// Feed de inicio -> se monta en /api/feed
export const feedRouter = Router();
feedRouter.use(requireAuth);
feedRouter.get('/', FeedController.obtener);

// Marketplace de ofertas -> se monta en /api/ofertas
export const mercadoRouter = Router();
mercadoRouter.use(requireAuth);
mercadoRouter.get('/', FeedController.ofertasPublicas);
mercadoRouter.get('/:id', FeedController.ofertaPublica);
mercadoRouter.post(
  '/:id/propuestas',
  requireRole(ROLES.FREELANCER),
  validate(crearPropuestaSchema),
  PropuestaController.crear
);
