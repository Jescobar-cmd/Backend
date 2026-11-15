import { z } from 'zod';

export const crearModeracionPublicacionSchema = z
  .object({
    tipo: z.enum(['servicio', 'proyecto']),
    publicacionId: z.number().int().positive(),
    accion: z.enum(['retirar', 'reactivar']),
    motivo: z.string().min(5).max(300).optional(),
    estadoAnterior: z.string(),
    estadoNuevo: z.string(),
  })
  .strict();

export const retirarPublicacionSchema = z
  .object({
    motivo: z.string().min(5).max(300),
  })
  .strict();

export const reactivarPublicacionSchema = z
  .object({
    motivo: z.string().optional(),
  })
  .strict();

export const listarPublicacionesQuerySchema = z
  .object({
    tipo: z.enum(['servicio', 'proyecto']),
    estado: z.enum(['activo', 'pausado', 'eliminado', 'abierto', 'en_progreso', 'completado', 'cancelado']).optional(),
    texto: z.string().optional(),
    page: z
      .preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().int().positive().default(1)),
    limit: z
      .preprocess(
        (val) => (val === undefined || val === '' ? undefined : Number(val)),
        z.number().int().min(1).max(50).default(20),
      ),
  })
  .strict();