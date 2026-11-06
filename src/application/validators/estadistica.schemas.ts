import { z } from 'zod';

export const consultaEstadisticasSchema = z
  .object({
    desde: z.coerce.date({ invalid_type_error: 'El parámetro "desde" no es una fecha válida' }).optional(),
    hasta: z.coerce.date({ invalid_type_error: 'El parámetro "hasta" no es una fecha válida' }).optional(),
  })
  .refine(
    (datos) => {
      if (datos.desde && datos.hasta) {
        return datos.desde.getTime() <= datos.hasta.getTime();
      }
      return true;
    },
    {
      message: '"desde" no puede ser posterior a "hasta"',
      path: ['desde'],
    }
  );

export type ConsultaEstadisticas = z.infer<typeof consultaEstadisticasSchema>;

