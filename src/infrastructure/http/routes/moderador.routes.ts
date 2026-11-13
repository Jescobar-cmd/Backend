import { Router } from 'express';
import { ModeratorController } from '../controllers/ModeratorController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { requiereRol } from '../middlewares/requiereRol';
import { validar } from '../middlewares/validar';
import { ROLES } from '../../../shared/constants/roles';
import {
  consultaDisputasSchema,
  consultaLiquidacionesSchema,
  consultaReportesSchema,
  resolverDisputaSchema,
  resolverReporteSchema,
  resolverRetiroSchema,
} from '../../../application/validators/moderador.schemas';

// Rutas administrativas/moderadoras -> se monta en /api/moderador
export const moderadorRouter = Router();
moderadorRouter.use(
  requiereAutenticacion,
  requiereRol(ROLES.ADMIN, ROLES.MODERADOR)
);

moderadorRouter.get('/dashboard', ModeratorController.dashboard);

moderadorRouter.get('/reportes', validar(consultaReportesSchema, 'query'), ModeratorController.reportes);
moderadorRouter.get('/reportes/:id', ModeratorController.reporte);
moderadorRouter.patch(
  '/reportes/:id/resolver',
  validar(resolverReporteSchema, 'body'),
  ModeratorController.resolverReporte
);

moderadorRouter.get('/disputas', validar(consultaDisputasSchema, 'query'), ModeratorController.disputas);
moderadorRouter.get('/disputas/:id', ModeratorController.disputa);
moderadorRouter.patch(
  '/disputas/:id/resolver',
  validar(resolverDisputaSchema, 'body'),
  ModeratorController.resolverDisputa
);

moderadorRouter.get(
  '/liquidaciones',
  validar(consultaLiquidacionesSchema, 'query'),
  ModeratorController.liquidaciones
);
moderadorRouter.patch(
  '/liquidaciones/:id/pagar',
  validar(resolverRetiroSchema, 'body'),
  ModeratorController.aprobarRetiro
);
