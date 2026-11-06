import { Router } from 'express';
import { PerfilController } from '../controllers/PerfilController';
import { PortafolioController } from '../controllers/PortafolioController';
import { ServicioController } from '../controllers/ServicioController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { validar } from '../middlewares/validar';
import { ROLES } from '../../../shared/constants/roles';
import { actualizarPerfilClienteSchema } from '../../../application/validators/perfil.schemas';

// Perfil del cliente -> se monta en /api/cliente
export const clienteRouter = Router();
clienteRouter.get('/perfil', requiereAutenticacion, requiereRol(ROLES.CLIENTE), PerfilController.miPerfil);
clienteRouter.patch(
  '/perfil',
  requiereAutenticacion,
  requiereRol(ROLES.CLIENTE),
  validar(actualizarPerfilClienteSchema),
  PerfilController.actualizarMiPerfil
);

// Perfil público de cualquier usuario -> se monta en /api/usuarios
export const usuariosRouter = Router();
usuariosRouter.get(
  '/:id/portafolio',
  requiereAutenticacion,
  PortafolioController.listarPublico
);
usuariosRouter.get(
  '/:id/calificaciones',
  requiereAutenticacion,
  PerfilController.calificacionesPublicas
);
usuariosRouter.get(
  '/:id/servicios',
  requiereAutenticacion,
  ServicioController.porFreelancer
);
usuariosRouter.get('/:id', requiereAutenticacion, PerfilController.perfilPublico);
