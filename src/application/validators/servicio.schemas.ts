import { z } from 'zod';

const preprocesarTexto = (valor: unknown) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;
  return valor;
};

const preprocesarPrecio = (valor: unknown) => {
  if (valor === undefined || valor === null || valor === '') return undefined;
  return typeof valor === 'string' ? Number(valor) : valor;
};

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

const categoriaId = z.preprocess(
  (valor) => {
    if (valor === undefined) return undefined;
    if (valor === null || valor === '') return null;
    return typeof valor === 'string' ? Number(valor) : valor;
  },
  z
    .number({ invalid_type_error: 'La categoría debe ser un id válido' })
    .int('La categoría debe ser un id válido')
    .positive('La categoría debe ser un id válido')
    .nullable()
    .optional()
);

const precio = z.preprocess(
  preprocesarPrecio,
  z
    .number({ required_error: 'El precio es requerido', invalid_type_error: 'El precio debe ser un número' })
    .positive('El precio debe ser mayor que 0')
);

export const crearServicioSchema = z
  .object({
    titulo: z
      .string({ required_error: 'El título es requerido' })
      .trim()
      .min(5, 'El título debe tener al menos 5 caracteres')
      .max(150, 'El título no puede exceder 150 caracteres'),
    descripcion: z
      .string({ required_error: 'La descripción es requerida' })
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(5000, 'La descripción no puede exceder 5000 caracteres'),
    precio,
    categoriaId,
    imagenUrl,
  })
  .strict();

export const actualizarServicioSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(5, 'El título debe tener al menos 5 caracteres')
      .max(150, 'El título no puede exceder 150 caracteres')
      .optional(),
    descripcion: z
      .string()
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(5000, 'La descripción no puede exceder 5000 caracteres')
      .optional(),
    precio: precio.optional(),
    categoriaId,
    imagenUrl,
  })
  .strict()
  .refine((datos) => Object.values(datos).some((valor) => valor !== undefined), {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export const cambiarEstadoServicioSchema = z
  .object({
    estado: z.enum(['activo', 'pausado', 'eliminado'], {
      errorMap: () => ({ message: "El estado debe ser 'activo', 'pausado' o 'eliminado'" }),
    }),
  })
  .strict();
