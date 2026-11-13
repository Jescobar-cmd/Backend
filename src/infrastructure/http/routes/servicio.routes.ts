import { Router } from 'express';
import { ServicioController } from '../controllers/ServicioController';
import { PropuestaController } from '../controllers/PropuestaController';
import { PerfilController } from '../controllers/PerfilController';
import { PortafolioController } from '../controllers/PortafolioController';
import { EstadisticaController } from '../controllers/EstadisticaController';
import { DashboardController } from '../controllers/DashboardController';
import { FreelancerController } from '../controllers/FreelancerController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { validar, validarQuery } from '../middlewares/validar';
import { ROLES } from '../../../shared/constants/roles';
import {
  actualizarServicioSchema,
  cambiarEstadoServicioSchema,
  crearServicioSchema,
} from '../../../application/validators/servicio.schemas';
import { actualizarPerfilFreelancerSchema } from '../../../application/validators/perfil.schemas';
import {
  actualizarPortafolioItemSchema,
  crearPortafolioItemSchema,
} from '../../../application/validators/portafolio.schemas';
import { consultaEstadisticasSchema } from '../../../application/validators/estadistica.schemas';
import { consultaNotificacionesSchema } from '../../../application/validators/notificacion.schemas';

// Catálogo de servicios -> se monta en /api/servicios
export const serviciosRouter = Router();
serviciosRouter.use(requiereAutenticacion);

serviciosRouter.get('/', ServicioController.listar);
serviciosRouter.get('/:id', ServicioController.detalle);
serviciosRouter.post(
  '/',
  requiereRol(ROLES.FREELANCER),
  validar(crearServicioSchema),
  ServicioController.crear
);
serviciosRouter.patch(
  '/:id',
  requiereRol(ROLES.FREELANCER),
  validar(actualizarServicioSchema),
  ServicioController.actualizar
);
serviciosRouter.patch(
  '/:id/estado',
  requiereRol(ROLES.FREELANCER),
  validar(cambiarEstadoServicioSchema),
  ServicioController.cambiarEstado
);

// Panel del freelancer -> se monta en /api/freelancer
export const freelancerRouter = Router();
freelancerRouter.use(requiereAutenticacion, requiereRol(ROLES.FREELANCER));
freelancerRouter.get('/perfil', PerfilController.miPerfilFreelancer);
freelancerRouter.patch(
  '/perfil',
  validar(actualizarPerfilFreelancerSchema),
  PerfilController.actualizarMiPerfilFreelancer
);
freelancerRouter.get('/servicios', ServicioController.misServicios);
freelancerRouter.get('/propuestas', PropuestaController.misPropuestas);
freelancerRouter.patch('/propuestas/:id/retirar', PropuestaController.retirar);
freelancerRouter.get('/portafolio', PortafolioController.listar);
freelancerRouter.post(
  '/portafolio',
  validar(crearPortafolioItemSchema),
  PortafolioController.crear
);
freelancerRouter.patch(
  '/portafolio/:id',
  validar(actualizarPortafolioItemSchema),
  PortafolioController.actualizar
);
freelancerRouter.delete('/portafolio/:id', PortafolioController.eliminar);
freelancerRouter.get(
  '/estadisticas',
  validarQuery(consultaEstadisticasSchema),
  EstadisticaController.misEstadisticas
);
freelancerRouter.get('/dashboard', DashboardController.obtener);
freelancerRouter.get(
  '/notificaciones',
  validarQuery(consultaNotificacionesSchema),
  FreelancerController.notificaciones
);
freelancerRouter.patch(
  '/notificaciones/leidas',
  FreelancerController.marcarTodasLeidas
);
freelancerRouter.patch(
  '/notificaciones/:id/leida',
  FreelancerController.marcarNotificacionLeida
);
freelancerRouter.get('/pagos', FreelancerController.pagos);
freelancerRouter.get('/pagos/:id/factura', FreelancerController.factura);
freelancerRouter.get('/liquidaciones', FreelancerController.liquidaciones);
freelancerRouter.post(
  '/liquidaciones/solicitar',
  FreelancerController.solicitarRetiro
);
