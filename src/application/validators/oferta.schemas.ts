import { z } from 'zod';

// Normaliza números que llegan como texto (formularios) y trata "" / null como null.
const preprocesarNumero = (valor: unknown) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;
  return typeof valor === 'string' ? Number(valor) : valor;
};

// Trata "" / null como null (borrar el valor).
const preprocesarTexto = (valor: unknown) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;
  return valor;
};

const presupuesto = z.preprocess(
  preprocesarNumero,
  z
    .number({ invalid_type_error: 'El presupuesto debe ser un número' })
    .min(0, 'El presupuesto no puede ser negativo')
    .nullable()
    .optional()
);

const plazoDias = z.preprocess(
  preprocesarNumero,
  z
    .number({ invalid_type_error: 'El plazo debe ser un número' })
    .int('El plazo debe ser un número entero de días')
    .min(1, 'El plazo debe ser de al menos 1 día')
    .nullable()
    .optional()
);

const categoriaId = z.preprocess(
  preprocesarNumero,
  z
    .number({ invalid_type_error: 'La categoría debe ser un id válido' })
    .int('La categoría debe ser un id válido')
    .positive('La categoría debe ser un id válido')
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

const habilidadIds = z
  .array(z.number({ invalid_type_error: 'Las habilidades deben ser ids numéricos' }).int().positive())
  .max(20, 'No puedes asignar más de 20 habilidades')
  .optional();

export const crearOfertaSchema = z
  .object({
    titulo: z
      .string({ required_error: 'El título es requerido' })
      .trim()
      .min(5, 'El título debe tener al menos 5 caracteres')
      .max(200, 'El título no puede exceder 200 caracteres'),
    descripcion: z
      .string({ required_error: 'La descripción es requerida' })
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(5000, 'La descripción no puede exceder 5000 caracteres'),
    presupuesto,
    plazoDias,
    categoriaId,
    imagenUrl,
    habilidadIds,
  })
  .strict();

export const actualizarOfertaSchema = z
  .object({
    titulo: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres').max(200, 'El título no puede exceder 200 caracteres').optional(),
    descripcion: z
      .string()
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(5000, 'La descripción no puede exceder 5000 caracteres')
      .optional(),
    presupuesto,
    plazoDias,
    categoriaId,
    imagenUrl,
    habilidadIds,
  })
  .strict()
  .refine((datos) => Object.values(datos).some((valor) => valor !== undefined), {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export const cambiarEstadoOfertaSchema = z
  .object({
    estado: z.enum(['abierto', 'en_progreso', 'completado', 'cancelado'], {
      errorMap: () => ({ message: "El estado debe ser 'abierto', 'en_progreso', 'completado' o 'cancelado'" }),
    }),
  })
  .strict();
