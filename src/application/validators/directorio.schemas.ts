import { z } from 'zod';
import { preprocesarEnteroPositivo } from './comunes.schemas';

export const consultaDirectorioSchema = z.object({
  page: z.preprocess(
    preprocesarEnteroPositivo,
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    preprocesarEnteroPositivo,
    z.number().int().min(1).max(50).optional().default(12)
  ),
  q: z
    .string()
    .trim()
    .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  habilidadId: z.preprocess(
    preprocesarEnteroPositivo,
    z
      .number({ invalid_type_error: 'El id de habilidad no es válido' })
      .int('El id de habilidad no es válido')
      .positive('El id de habilidad no es válido')
      .optional()
  ),
  categoriaId: z.preprocess(
    preprocesarEnteroPositivo,
    z
      .number({ invalid_type_error: 'El id de categoría no es válido' })
      .int('El id de categoría no es válido')
      .positive('El id de categoría no es válido')
      .optional()
  ),
});

export type ConsultaDirectorio = z.infer<typeof consultaDirectorioSchema>;

