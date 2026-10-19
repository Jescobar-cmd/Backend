import { z } from 'zod';

/**
 * Cadena editable opcional:
 *  - `undefined` (campo no enviado)  -> no se toca.
 *  - `""` o `null`                   -> se guarda como null (borra el valor).
 */
const cadenaEditable = (max: number, mensajeMax: string) =>
  z
    .string({ invalid_type_error: 'Debe ser texto' })
    .trim()
    .max(max, mensajeMax)
    .nullable()
    .optional()
    .transform((valor) => (valor === undefined ? undefined : valor && valor.length > 0 ? valor : null));

export const actualizarPerfilClienteSchema = z
  .object({
    nombre: z
      .string({ invalid_type_error: 'El nombre debe ser texto' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .optional(),
    telefono: cadenaEditable(20, 'El teléfono no puede exceder 20 caracteres').refine(
      (valor) => valor === undefined || valor === null || /^[0-9+()\s-]{7,20}$/.test(valor),
      { message: 'El teléfono debe contener entre 7 y 20 caracteres válidos' }
    ),
    // El front sube la imagen a Cloudinary y aquí solo guardamos la URL.
    fotoPerfil: cadenaEditable(500, 'La URL de la foto no puede exceder 500 caracteres').refine(
      (valor) => valor === undefined || valor === null || /^https?:\/\/.+/.test(valor),
      { message: 'La foto debe ser una URL válida (http o https)' }
    ),
    descripcion: cadenaEditable(500, 'La descripción no puede exceder 500 caracteres'),
    nombreEmpresa: cadenaEditable(150, 'El nombre de la empresa no puede exceder 150 caracteres'),
    tipoCliente: z
      .enum(['natural', 'empresa'], { errorMap: () => ({ message: "El tipo de cliente debe ser 'natural' o 'empresa'" }) })
      .optional(),
  })
  // .strict() => rechaza cualquier campo no permitido (email, rol, estado, etc.) con 400.
  .strict()
  .refine((datos) => Object.values(datos).some((valor) => valor !== undefined), {
    message: 'Debes enviar al menos un campo para actualizar',
  });
