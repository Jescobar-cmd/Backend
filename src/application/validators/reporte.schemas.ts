import { z } from 'zod';
import { preprocesarEnteroPositivo } from './comunes.schemas';

export const crearReporteSchema = z
  .object({
    usuarioReportadoId: z.preprocess(
      preprocesarEnteroPositivo,
      z.number().int().positive().optional()
    ),
    proyectoId: z.preprocess(
      preprocesarEnteroPositivo,
      z.number().int().positive().optional()
    ),
    motivo: z
      .string({ required_error: 'El motivo es requerido' })
      .trim()
      .min(3, 'El motivo debe tener al menos 3 caracteres')
      .max(100, 'El motivo no puede exceder 100 caracteres'),
    descripcion: z
      .string()
      .trim()
      .max(1000, 'La descripción no puede exceder 1000 caracteres')
      .optional(),
  })
  .strict()
  .refine(
    (datos) => Boolean(datos.usuarioReportadoId || datos.proyectoId),
    {
      message: 'Debes indicar el usuario o el proyecto a reportar',
      path: ['usuarioReportadoId'],
    }
  );
