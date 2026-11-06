import { Router } from 'express';
import { DirectorioFreelancerController } from '../controllers/DirectorioFreelancerController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';

// Directorio público -> se monta en /api/freelancers
export const directorioFreelancerRouter = Router();
directorioFreelancerRouter.get(
  '/',
  requiereAutenticacion,
  DirectorioFreelancerController.listar
);
