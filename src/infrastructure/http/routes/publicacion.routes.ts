import { Router } from 'express';
import { PublicacionController } from '../controllers/PublicacionController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { validar } from '../middlewares/validar';
import { crearPublicacionSchema } from '../../../application/validators/publicacion.schemas';

// Blog: cualquier usuario autenticado puede leer y publicar.
export const publicacionesRouter = Router();
publicacionesRouter.use(requiereAutenticacion);

publicacionesRouter.post('/', validar(crearPublicacionSchema), PublicacionController.crear);
publicacionesRouter.get('/', PublicacionController.listar);
publicacionesRouter.get('/:id', PublicacionController.detalle);
publicacionesRouter.delete('/:id', PublicacionController.eliminar);
publicacionesRouter.post('/:id/like', PublicacionController.alternarMeGusta);
