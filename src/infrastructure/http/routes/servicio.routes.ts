import { Router } from 'express';
import { ServicioController } from '../controllers/ServicioController';
import { PropuestaController } from '../controllers/PropuestaController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { validar } from '../middlewares/validar';
import { ROLES } from '../../../shared/constants/roles';
import {
  actualizarServicioSchema,
  cambiarEstadoServicioSchema,
  crearServicioSchema,
} from '../../../application/validators/servicio.schemas';

// Catálogo de servicios -> se monta en /api/servicios
export const serviciosRouter = Router();
serviciosRouter.use(requiereAutenticacion);

serviciosRouter.get('/', ServicioController.listar);
serviciosRouter.get('/:id', ServicioController.detalle);
serviciosRouter.post(
  '/',
  requiereRol(ROLES.FREELANCER),
  validar(crearServicioSchema),
  ServicioController.crear
);
serviciosRouter.patch(
  '/:id',
  requiereRol(ROLES.FREELANCER),
  validar(actualizarServicioSchema),
  ServicioController.actualizar
);
serviciosRouter.patch(
  '/:id/estado',
  requiereRol(ROLES.FREELANCER),
  validar(cambiarEstadoServicioSchema),
  ServicioController.cambiarEstado
);

// Panel del freelancer -> se monta en /api/freelancer
export const freelancerRouter = Router();
freelancerRouter.use(requiereAutenticacion, requiereRol(ROLES.FREELANCER));
freelancerRouter.get('/servicios', ServicioController.misServicios);
freelancerRouter.get('/propuestas', PropuestaController.misPropuestas);
