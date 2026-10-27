import { z } from 'zod';

const preprocesarMonto = (valor: unknown) => {
  if (valor === undefined || valor === null || valor === '') return undefined;
  return typeof valor === 'string' ? Number(valor) : valor;
};

export const crearPropuestaSchema = z
  .object({
    mensaje: z.preprocess(
      (valor) => (valor === undefined ? undefined : valor === null || valor === '' ? null : valor),
      z
        .string()
        .trim()
        .max(2000, 'El mensaje no puede exceder 2000 caracteres')
        .nullable()
        .optional()
    ),
    montoPropuesto: z.preprocess(
      preprocesarMonto,
      z
        .number({
          required_error: 'El monto es requerido',
          invalid_type_error: 'El monto debe ser un número',
        })
        .positive('El monto debe ser mayor que 0')
    ),
  })
  .strict();
