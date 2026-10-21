import { Router } from 'express';
import { PerfilController } from '../controllers/PerfilController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { ROLES } from '../../../shared/constants/roles';
import { actualizarPerfilClienteSchema } from '../../../application/validators/perfil.schemas';

// Perfil del cliente -> se monta en /api/cliente
export const clienteRouter = Router();
clienteRouter.get('/perfil', requireAuth, requireRole(ROLES.CLIENTE), PerfilController.miPerfil);
clienteRouter.patch(
  '/perfil',
  requireAuth,
  requireRole(ROLES.CLIENTE),
  validate(actualizarPerfilClienteSchema),
  PerfilController.actualizarMiPerfil
);

// Perfil público de cualquier usuario -> se monta en /api/usuarios
export const usuariosRouter = Router();
usuariosRouter.get('/:id', requireAuth, PerfilController.perfilPublico);
