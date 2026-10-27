import { z } from 'zod';

// Trata "" / null como null (campo opcional vacío).
const preprocesarTexto = (valor: unknown) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;
  return valor;
};

const titulo = z.preprocess(
  preprocesarTexto,
  z
    .string({ invalid_type_error: 'El título debe ser texto' })
    .trim()
    .max(150, 'El título no puede exceder 150 caracteres')
    .nullable()
    .optional()
);

// El front sube la imagen a Cloudinary y aquí solo guardamos la URL.
const imagenUrl = z.preprocess(
  preprocesarTexto,
  z
    .string()
    .trim()
    .max(500, 'La URL de la imagen no puede exceder 500 caracteres')
    .regex(/^https?:\/\/.+/, 'La imagen debe ser una URL válida (http o https)')
    .nullable()
    .optional()
);

export const crearPublicacionSchema = z
  .object({
    titulo,
    contenido: z
      .string({ required_error: 'El contenido es requerido' })
      .trim()
      .min(1, 'El contenido no puede estar vacío')
      .max(5000, 'El contenido no puede exceder 5000 caracteres'),
    imagenUrl,
  })
  .strict();
