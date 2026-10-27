import { Router } from 'express';
import { OfertaController } from '../controllers/OfertaController';
import { PropuestaController } from '../controllers/PropuestaController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { ROLES } from '../../../shared/constants/roles';
import {
  actualizarOfertaSchema,
  cambiarEstadoOfertaSchema,
  crearOfertaSchema,
} from '../../../application/validators/oferta.schemas';

// Todas las rutas de ofertas son del cliente autenticado.
export const ofertasRouter = Router();
ofertasRouter.use(requireAuth, requireRole(ROLES.CLIENTE));

ofertasRouter.post('/', validate(crearOfertaSchema), OfertaController.crear);
ofertasRouter.get('/', OfertaController.listar);
ofertasRouter.get('/:id', OfertaController.detalle);
ofertasRouter.patch('/:id', validate(actualizarOfertaSchema), OfertaController.actualizar);
ofertasRouter.patch('/:id/estado', validate(cambiarEstadoOfertaSchema), OfertaController.cambiarEstado);
ofertasRouter.get('/:id/propuestas', OfertaController.propuestas);
ofertasRouter.post(
  '/:id/propuestas/:propuestaId/aceptar',
  PropuestaController.aceptar
);
ofertasRouter.post(
  '/:id/propuestas/:propuestaId/rechazar',
  PropuestaController.rechazar
);
