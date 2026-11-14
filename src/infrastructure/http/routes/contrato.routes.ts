import { Router } from 'express';
import { ContratoController } from '../controllers/ContratoController';
import { EntregaContratoController } from '../controllers/EntregaContratoController';
import { DisputaContratoController } from '../controllers/DisputaContratoController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { validar } from '../middlewares/validar';
import {
  calificarContratoSchema,
  cambiarEstadoContratoSchema,
} from '../../../application/validators/contrato.schemas';
import {
  rechazarEntregaSchema,
  registrarEntregaSchema,
} from '../../../application/validators/entrega.schemas';
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
contratosRouter.get('/:id/entregas', EntregaContratoController.entregas);
contratosRouter.post(
  '/:id/entregas',
  requiereRol(ROLES.FREELANCER),
  validar(registrarEntregaSchema),
  EntregaContratoController.registrarEntrega
);
contratosRouter.patch(
  '/:id/entregas/:entregaId',
  requiereRol(ROLES.FREELANCER),
  validar(registrarEntregaSchema),
  EntregaContratoController.actualizarEntrega
);
contratosRouter.patch(
  '/:id/aprobar-entrega',
  requiereRol(ROLES.CLIENTE),
  EntregaContratoController.aprobarEntrega
);
contratosRouter.patch(
  '/:id/rechazar-entrega',
  requiereRol(ROLES.CLIENTE),
  validar(rechazarEntregaSchema),
  EntregaContratoController.rechazarEntrega
);

// Disputas formales del contrato.
contratosRouter.get('/:id/disputas', DisputaContratoController.disputas);
contratosRouter.post(
  '/:id/disputas',
  requiereRol(ROLES.CLIENTE, ROLES.FREELANCER),
  validar(abrirDisputaSchema),
  DisputaContratoController.abrirDisputa
);
