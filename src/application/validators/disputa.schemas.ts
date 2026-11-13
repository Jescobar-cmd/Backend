import { z } from 'zod';

const evidenciaUrl = z.preprocess(
  (valor) => {
    if (valor === undefined) return undefined;
    if (valor === null || valor === '') return null;
    return valor;
  },
  z
    .string()
    .trim()
    .max(500, 'La URL de evidencia no puede exceder 500 caracteres')
    .regex(/^https?:\/\/.+/, 'La evidencia debe ser una URL válida (http o https)')
    .nullable()
    .optional()
);

export const abrirDisputaSchema = z
  .object({
    motivo: z
      .string({ required_error: 'El motivo es requerido' })
      .trim()
      .min(3, 'El motivo debe tener al menos 3 caracteres')
      .max(120, 'El motivo no puede exceder 120 caracteres'),
    descripcion: z
      .string({ required_error: 'La descripción es requerida' })
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(2000, 'La descripción no puede exceder 2000 caracteres'),
    evidenciaUrl,
  })
  .strict();
