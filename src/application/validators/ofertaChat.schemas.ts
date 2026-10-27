import { z } from 'zod';

const preprocesarMonto = (valor: unknown) => {
  if (valor === undefined || valor === null || valor === '') return undefined;
  return typeof valor === 'string' ? Number(valor) : valor;
};

const fechaExpiracion = z.preprocess(
  (valor) => (valor === undefined || valor === null || valor === '' ? null : valor),
  z.coerce
    .date({ invalid_type_error: 'La fecha de expiración no es válida' })
    .nullable()
    .optional()
);

export const crearOfertaChatSchema = z
  .object({
    monto: z.preprocess(
      preprocesarMonto,
      z
        .number({
          required_error: 'El monto es requerido',
          invalid_type_error: 'El monto debe ser un número',
        })
        .positive('El monto debe ser mayor que 0')
    ),
    descripcion: z.preprocess(
      (valor) => (valor === undefined ? undefined : valor === null || valor === '' ? null : valor),
      z
        .string()
        .trim()
        .max(1000, 'La descripción no puede exceder 1000 caracteres')
        .nullable()
        .optional()
    ),
    fechaExpiracion,
  })
  .strict();

export const contraofertaSchema = crearOfertaChatSchema;
