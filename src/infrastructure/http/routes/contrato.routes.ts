import { Router } from 'express';
import { ContratoController } from '../controllers/ContratoController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { validar } from '../middlewares/validar';
import {
  calificarContratoSchema,
  cambiarEstadoContratoSchema,
} from '../../../application/validators/contrato.schemas';
import { registrarEntregaSchema } from '../../../application/validators/entrega.schemas';
import { abrirDisputaSchema } from '../../../application/validators/disputa.schemas';
import { ROLES } from '../../../shared/constants/roles';

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

// Entregas del contrato: el freelancer entrega y el cliente aprueba.
contratosRouter.get('/:id/entregas', ContratoController.entregas);
contratosRouter.post(
  '/:id/entregas',
  requiereRol(ROLES.FREELANCER),
  validar(registrarEntregaSchema),
  ContratoController.registrarEntrega
);
contratosRouter.patch(
  '/:id/aprobar-entrega',
  requiereRol(ROLES.CLIENTE),
  ContratoController.aprobarEntrega
);

// Disputas formales del contrato.
contratosRouter.get('/:id/disputas', ContratoController.disputas);
contratosRouter.post(
  '/:id/disputas',
  requiereRol(ROLES.CLIENTE, ROLES.FREELANCER),
  validar(abrirDisputaSchema),
  ContratoController.abrirDisputa
);
