import { z } from 'zod';

const puntuacion = z.preprocess(
  (valor) => (typeof valor === 'string' ? Number(valor) : valor),
  z
    .number({ invalid_type_error: 'La puntuación debe ser un número' })
    .int('La puntuación debe ser un número entero')
    .min(1, 'La puntuación debe estar entre 1 y 5')
    .max(5, 'La puntuación debe estar entre 1 y 5')
);

const comentario = z
  .string({ invalid_type_error: 'El comentario debe ser texto' })
  .trim()
  .max(1000, 'El comentario no puede exceder 1000 caracteres')
  .nullable()
  .optional()
  .transform((valor) => (valor === undefined ? undefined : valor && valor.length > 0 ? valor : null));

export const cambiarEstadoContratoSchema = z
  .object({
    estado: z.enum(['completado', 'cancelado'], {
      errorMap: () => ({ message: "El estado debe ser 'completado' o 'cancelado'" }),
    }),
  })
  .strict();

export const calificarContratoSchema = z
  .object({
    puntuacion,
    comentario,
  })
  .strict();
