import { Router } from 'express';
import { PublicacionController } from '../controllers/PublicacionController';
import { requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { crearPublicacionSchema } from '../../../application/validators/publicacion.schemas';

// Blog: cualquier usuario autenticado puede leer y publicar.
export const publicacionesRouter = Router();
publicacionesRouter.use(requireAuth);

publicacionesRouter.post('/', validate(crearPublicacionSchema), PublicacionController.crear);
publicacionesRouter.get('/', PublicacionController.listar);
publicacionesRouter.get('/:id', PublicacionController.detalle);
publicacionesRouter.delete('/:id', PublicacionController.eliminar);
publicacionesRouter.post('/:id/like', PublicacionController.alternarMeGusta);
