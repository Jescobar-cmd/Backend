import { z } from 'zod';

const preprocesarTexto = (valor: unknown) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;
  return valor;
};

const urlOpcional = z.preprocess(
  preprocesarTexto,
  z
    .string()
    .trim()
    .max(500, 'La URL no puede exceder 500 caracteres')
    .regex(/^https?:\/\/.+/, 'Debe ser una URL válida (http o https)')
    .nullable()
    .optional()
);

export const crearPortafolioItemSchema = z
  .object({
    titulo: z
      .string({ required_error: 'El título es requerido' })
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(150, 'El título no puede exceder 150 caracteres'),
    descripcion: z
      .string()
      .trim()
      .max(1000, 'La descripción no puede exceder 1000 caracteres')
      .nullable()
      .optional(),
    imagenUrl: urlOpcional,
    enlaceUrl: urlOpcional,
  })
  .strict();

export const actualizarPortafolioItemSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(150, 'El título no puede exceder 150 caracteres')
      .optional(),
    descripcion: z
      .string()
      .trim()
      .max(1000, 'La descripción no puede exceder 1000 caracteres')
      .nullable()
      .optional(),
    imagenUrl: urlOpcional,
    enlaceUrl: urlOpcional,
  })
  .strict()
  .refine((datos) => Object.values(datos).some((valor) => valor !== undefined), {
    message: 'Debes enviar al menos un campo para actualizar',
  });
