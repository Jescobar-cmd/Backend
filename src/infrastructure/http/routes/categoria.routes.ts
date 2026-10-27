import { Router } from 'express';
import { CategoriaController } from '../controllers/CategoriaController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';

// Catálogo de categorías: cualquier usuario autenticado puede consultarlo.
export const categoriasRouter = Router();
categoriasRouter.get('/', requiereAutenticacion, CategoriaController.listar);
