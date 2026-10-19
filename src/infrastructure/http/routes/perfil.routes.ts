import { Router } from 'express';
import { PerfilController } from '../controllers/PerfilController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate';
import { actualizarPerfilClienteSchema } from '../../../application/validators/perfil.schemas';

// Rol Cliente según el modelo Rol del schema (2 = Freelancer, 3 = Cliente).
const ROL_CLIENTE = 3;

// Perfil del cliente -> se monta en /api/cliente
export const clienteRouter = Router();
clienteRouter.get('/perfil', requireAuth, requireRole(ROL_CLIENTE), PerfilController.miPerfil);
clienteRouter.patch(
  '/perfil',
  requireAuth,
  requireRole(ROL_CLIENTE),
  validate(actualizarPerfilClienteSchema),
  PerfilController.actualizarMiPerfil
);

// Perfil público de cualquier usuario -> se monta en /api/usuarios
export const usuariosRouter = Router();
usuariosRouter.get('/:id', requireAuth, PerfilController.perfilPublico);
