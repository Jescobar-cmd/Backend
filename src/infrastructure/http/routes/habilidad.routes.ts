import { Router } from 'express';
import { HabilidadController } from '../controllers/HabilidadController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';

// Catálogo de habilidades -> se monta en /api/habilidades
export const habilidadesRouter = Router();
habilidadesRouter.use(requiereAutenticacion);
habilidadesRouter.get('/', HabilidadController.listar);
