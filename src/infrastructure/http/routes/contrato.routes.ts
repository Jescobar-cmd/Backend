import { Router } from 'express';
import { ContratoController } from '../controllers/ContratoController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { validar } from '../middlewares/validar';
import {
  calificarContratoSchema,
  cambiarEstadoContratoSchema,
} from '../../../application/validators/contrato.schemas';

// Contratos -> se monta en /api/contratos
export const contratosRouter = Router();
contratosRouter.use(requiereAutenticacion);

contratosRouter.get('/', ContratoController.listar);
contratosRouter.get('/:id', ContratoController.detalle);
contratosRouter.patch(
  '/:id/estado',
  validar(cambiarEstadoContratoSchema),
  ContratoController.cambiarEstado
);
contratosRouter.get('/:id/calificaciones', ContratoController.calificaciones);
contratosRouter.post(
  '/:id/calificaciones',
  validar(calificarContratoSchema),
  ContratoController.calificar
);
