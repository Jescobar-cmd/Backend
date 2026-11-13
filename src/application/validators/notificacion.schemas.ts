import { z } from 'zod';
import { preprocesarEnteroPositivo } from './comunes.schemas';

export const consultaNotificacionesSchema = z.object({
  page: z.preprocess(
    preprocesarEnteroPositivo,
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    preprocesarEnteroPositivo,
    z.number().int().min(1).max(50).optional().default(20)
  ),
  soloNoLeidas: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional().default(false)
  ),
});

export type ConsultaNotificaciones = z.infer<typeof consultaNotificacionesSchema>;
