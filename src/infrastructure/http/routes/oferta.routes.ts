import { Router } from 'express';
import { OfertaController } from '../controllers/OfertaController';
import { PropuestaController } from '../controllers/PropuestaController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { validar } from '../middlewares/validar';
import { ROLES } from '../../../shared/constants/roles';
import {
  actualizarOfertaSchema,
  cambiarEstadoOfertaSchema,
  crearOfertaSchema,
} from '../../../application/validators/oferta.schemas';

// Todas las rutas de ofertas son del cliente autenticado.
export const ofertasRouter = Router();
ofertasRouter.use(requiereAutenticacion, requiereRol(ROLES.CLIENTE));

ofertasRouter.post('/', validar(crearOfertaSchema), OfertaController.crear);
ofertasRouter.get('/', OfertaController.listar);
ofertasRouter.get('/:id', OfertaController.detalle);
ofertasRouter.patch('/:id', validar(actualizarOfertaSchema), OfertaController.actualizar);
ofertasRouter.patch('/:id/estado', validar(cambiarEstadoOfertaSchema), OfertaController.cambiarEstado);
ofertasRouter.get('/:id/propuestas', OfertaController.propuestas);
ofertasRouter.post(
  '/:id/propuestas/:propuestaId/aceptar',
  PropuestaController.aceptar
);
ofertasRouter.post(
  '/:id/propuestas/:propuestaId/rechazar',
  PropuestaController.rechazar
);
