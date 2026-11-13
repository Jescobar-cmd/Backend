import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { ROLES } from '../../../shared/constants/roles';

// Funciones exclusivas del rol Cliente -> se monta en /api/cliente
export const clienteRolRouter = Router();
const soloCliente = [requiereAutenticacion, requiereRol(ROLES.CLIENTE)];

clienteRolRouter.get('/dashboard', ...soloCliente, ClienteController.dashboard);
clienteRolRouter.post(
  '/servicios/:id/contratar',
  ...soloCliente,
  ClienteController.contratarServicio
);
clienteRolRouter.get('/pagos', ...soloCliente, ClienteController.pagos);
clienteRolRouter.get('/pagos/:id/factura', ...soloCliente, ClienteController.factura);
clienteRolRouter.get(
  '/notificaciones',
  ...soloCliente,
  ClienteController.notificaciones
);
clienteRolRouter.patch(
  '/notificaciones/leidas',
  ...soloCliente,
  ClienteController.marcarTodasLeidas
);
clienteRolRouter.patch(
  '/notificaciones/:id/leida',
  ...soloCliente,
  ClienteController.marcarNotificacionLeida
);
