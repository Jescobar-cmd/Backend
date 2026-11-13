import { z } from 'zod';

const urlOpcional = z.preprocess(
  (valor) => {
    if (valor === undefined) return undefined;
    if (valor === null || valor === '') return null;
    return valor;
  },
  z
    .string()
    .trim()
    .max(500, 'La URL no puede exceder 500 caracteres')
    .regex(/^https?:\/\/.+/, 'La URL debe ser válida (http o https)')
    .nullable()
    .optional()
);

export const registrarEntregaSchema = z
  .object({
    mensaje: z
      .string()
      .trim()
      .max(2000, 'El mensaje no puede exceder 2000 caracteres')
      .nullable()
      .optional(),
    archivoUrl: urlOpcional,
    enlaceUrl: urlOpcional,
  })
  .strict()
  .refine(
    (datos) =>
      Boolean(
        (datos.mensaje && datos.mensaje.length > 0) ||
          datos.archivoUrl ||
          datos.enlaceUrl
      ),
    {
      message: 'Debes enviar un mensaje, un archivo o un enlace de entrega',
      path: ['mensaje'],
    }
  );
