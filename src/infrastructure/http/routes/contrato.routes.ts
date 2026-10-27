import { Router } from 'express';
import { ContratoController } from '../controllers/ContratoController';
import { requireAuth } from '../middlewares/authMiddleware';

// Contratos (lectura mínima) -> se monta en /api/contratos
export const contratosRouter = Router();
contratosRouter.use(requireAuth);

contratosRouter.get('/', ContratoController.listar);
contratosRouter.get('/:id', ContratoController.detalle);
