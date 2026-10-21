import { Router } from 'express';
import { CategoriaController } from '../controllers/CategoriaController';
import { requireAuth } from '../middlewares/authMiddleware';

// Catálogo de categorías: cualquier usuario autenticado puede consultarlo.
export const categoriasRouter = Router();
categoriasRouter.get('/', requireAuth, CategoriaController.listar);
