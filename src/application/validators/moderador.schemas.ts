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
    resolucion: z.string().trim().min(3, 'La resolución debe tener al menos 3 caracteres').max(1000, 'La resolución no puede exceder 1000 caracteres'),
  })
  .strict();

export const consultaLiquidacionesSchema = z
  .object({
    estado: z.enum(['pendiente', 'solicitada', 'pagada']).optional(),
    page: z.preprocess(preprocesarEnteroPositivo, z.number().int().positive().optional().default(1)),
    limit: z.preprocess(preprocesarEnteroPositivo, z.number().int().min(1).max(50).optional().default(20)),
  })
  .strict();

export const resolverRetiroSchema = z
  .object({
    referencia: z.string().trim().max(100, 'La referencia no puede exceder 100 caracteres').optional(),
  })
  .strict();
