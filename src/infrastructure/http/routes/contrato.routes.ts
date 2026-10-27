import { Router } from 'express';
import { ContratoController } from '../controllers/ContratoController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';

// Contratos (lectura mínima) -> se monta en /api/contratos
export const contratosRouter = Router();
contratosRouter.use(requiereAutenticacion);

contratosRouter.get('/', ContratoController.listar);
contratosRouter.get('/:id', ContratoController.detalle);
