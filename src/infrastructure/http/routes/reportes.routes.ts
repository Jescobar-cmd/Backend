import { Router } from 'express';
import { ReporteController } from '../controllers/ReporteController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { limitarIntentos } from '../middlewares/limitarIntentos';
import { validar } from '../middlewares/validar';
import { crearReporteSchema } from '../../../application/validators/reporte.schemas';

// Reportes de usuarios -> se monta en /api/reportes
export const reportesRouter = Router();
reportesRouter.use(requiereAutenticacion);

reportesRouter.post(
  '/',
  limitarIntentos({ ventanaMs: 60 * 60 * 1000, maximo: 20 }),
  validar(crearReporteSchema),
  ReporteController.crear
);
