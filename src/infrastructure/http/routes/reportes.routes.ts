import { Router } from 'express';
import { ReporteController } from '../controllers/ReporteController';
import { requiereAutenticacion } from '../middlewares/middlewareAutenticacion';
import { validar } from '../middlewares/validar';
import { crearReporteSchema } from '../../../application/validators/reporte.schemas';

// Reportes de usuarios -> se monta en /api/reportes
export const reportesRouter = Router();
reportesRouter.use(requiereAutenticacion);

reportesRouter.post('/', validar(crearReporteSchema), ReporteController.crear);
