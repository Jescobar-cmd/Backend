import { Router } from 'express';
import { FeedController } from '../controllers/FeedController';
import { requireAuth } from '../middlewares/authMiddleware';

// Feed de inicio -> se monta en /api/feed
export const feedRouter = Router();
feedRouter.use(requireAuth);
feedRouter.get('/', FeedController.obtener);

// Marketplace de ofertas -> se monta en /api/ofertas
export const mercadoRouter = Router();
mercadoRouter.use(requireAuth);
mercadoRouter.get('/', FeedController.ofertasPublicas);
mercadoRouter.get('/:id', FeedController.ofertaPublica);
