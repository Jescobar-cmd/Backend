import { z } from 'zod';

const preprocesarId = (valor: unknown) => {
  if (valor === undefined || valor === null || valor === '') return undefined;
  return typeof valor === 'string' ? Number(valor) : valor;
};

const idOpcional = z.preprocess(
  preprocesarId,
  z
    .number({ invalid_type_error: 'El id debe ser un número' })
    .int('El id debe ser un entero')
    .positive('El id debe ser positivo')
    .optional()
);

export const crearConversacionSchema = z
  .object({
    servicioId: idOpcional,
    proyectoId: idOpcional,
    freelancerId: idOpcional,
  })
  .strict()
  .refine(
    (datos) =>
      datos.servicioId !== undefined ||
      datos.proyectoId !== undefined ||
      datos.freelancerId !== undefined,
    { message: 'Debes indicar servicioId, proyectoId o freelancerId' }
  );

export const enviarMensajeSchema = z
  .object({
    contenido: z
      .string({ required_error: 'El mensaje es requerido' })
      .trim()
      .min(1, 'El mensaje no puede estar vacío')
      .max(2000, 'El mensaje no puede exceder 2000 caracteres'),
  })
  .strict();
