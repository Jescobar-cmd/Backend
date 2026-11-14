import { z } from 'zod';
import { preprocesarEnteroPositivo } from './comunes.schemas';

export const consultaReportesSchema = z
  .object({
    estado: z.enum(['pendiente', 'resuelto', 'rechazado']).optional(),
    page: z.preprocess(preprocesarEnteroPositivo, z.number().int().positive().optional().default(1)),
    limit: z.preprocess(preprocesarEnteroPositivo, z.number().int().min(1).max(50).optional().default(20)),
  })
  .strict();

export const resolverReporteSchema = z
  .object({
    estado: z.enum(['resuelto', 'rechazado']).optional().default('resuelto'),
    resolucion: z.string().trim().min(3, 'La resolución debe tener al menos 3 caracteres').max(1000, 'La resolución no puede exceder 1000 caracteres'),
  })
  .strict();

export const consultaDisputasSchema = z
  .object({
    estado: z.enum(['abierta', 'en_revision', 'resuelta', 'rechazada']).optional(),
    page: z.preprocess(preprocesarEnteroPositivo, z.number().int().positive().optional().default(1)),
    limit: z.preprocess(preprocesarEnteroPositivo, z.number().int().min(1).max(50).optional().default(20)),
  })
  .strict();

export const resolverDisputaSchema = z
  .object({
    estado: z.enum(['resuelta', 'rechazada']),
    /** Solo aplica cuando la disputa se resuelve: a quién se le entrega el dinero. */
    resultado: z.enum(['reembolso_cliente', 'liberar_freelancer']).optional(),
    resolucion: z.string().trim().min(3, 'La resolución debe tener al menos 3 caracteres').max(1000, 'La resolución no puede exceder 1000 caracteres'),
  })
  .strict()
  .superRefine((datos, ctx) => {
    if (datos.estado === 'resuelta' && !datos.resultado) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['resultado'],
        message:
          "Debes indicar 'reembolso_cliente' o 'liberar_freelancer' al resolver la disputa",
      });
    }
  });

export const consultaLiquidacionesSchema = z
  .object({
    estado: z.enum(['pendiente', 'solicitada', 'pagada', 'rechazada']).optional(),
    page: z.preprocess(preprocesarEnteroPositivo, z.number().int().positive().optional().default(1)),
    limit: z.preprocess(preprocesarEnteroPositivo, z.number().int().min(1).max(50).optional().default(20)),
  })
  .strict();

export const resolverRetiroSchema = z
  .object({
    estado: z.enum(['pagada', 'rechazada']).optional().default('pagada'),
    referencia: z.string().trim().max(100, 'La referencia no puede exceder 100 caracteres').optional(),
    motivoRechazo: z
      .string()
      .trim()
      .max(255, 'El motivo no puede exceder 255 caracteres')
      .optional(),
  })
  .strict()
  .superRefine((datos, ctx) => {
    if (datos.estado === 'rechazada' && !datos.motivoRechazo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['motivoRechazo'],
        message: 'Debes indicar el motivo del rechazo para devolver el saldo',
      });
    }
  });

export const suspenderUsuarioSchema = z
  .object({
    motivo: z
      .string()
      .trim()
      .min(3, 'El motivo debe tener al menos 3 caracteres')
      .max(500, 'El motivo no puede exceder 500 caracteres'),
  })
  .strict();
