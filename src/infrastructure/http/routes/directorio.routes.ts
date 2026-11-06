import { Router } from 'express';
import { DirectorioFreelancerController } from '../controllers/DirectorioFreelancerController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { validarQuery } from '../middlewares/validar';
import { consultaDirectorioSchema } from '../../../application/validators/directorio.schemas';

// Directorio público -> se monta en /api/freelancers
export const directorioFreelancerRouter = Router();
directorioFreelancerRouter.get(
  '/',
  requiereAutenticacion,
  validarQuery(consultaDirectorioSchema),
  DirectorioFreelancerController.listar
);
