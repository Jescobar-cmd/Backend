import { Router } from 'express';
import { ServicioController } from '../controllers/ServicioController';
import { PropuestaController } from '../controllers/PropuestaController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { ROLES } from '../../../shared/constants/roles';
import {
  actualizarServicioSchema,
  cambiarEstadoServicioSchema,
  crearServicioSchema,
} from '../../../application/validators/servicio.schemas';

// Catálogo de servicios -> se monta en /api/servicios
export const serviciosRouter = Router();
serviciosRouter.use(requireAuth);

serviciosRouter.get('/', ServicioController.listar);
serviciosRouter.get('/:id', ServicioController.detalle);
serviciosRouter.post(
  '/',
  requireRole(ROLES.FREELANCER),
  validate(crearServicioSchema),
  ServicioController.crear
);
serviciosRouter.patch(
  '/:id',
  requireRole(ROLES.FREELANCER),
  validate(actualizarServicioSchema),
  ServicioController.actualizar
);
serviciosRouter.patch(
  '/:id/estado',
  requireRole(ROLES.FREELANCER),
  validate(cambiarEstadoServicioSchema),
  ServicioController.cambiarEstado
);

// Panel del freelancer -> se monta en /api/freelancer
export const freelancerRouter = Router();
freelancerRouter.use(requireAuth, requireRole(ROLES.FREELANCER));
freelancerRouter.get('/servicios', ServicioController.misServicios);
freelancerRouter.get('/propuestas', PropuestaController.misPropuestas);
