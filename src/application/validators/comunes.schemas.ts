import { z } from 'zod';

/**
 * Preprocesa strings numéricos o números para garantizar que sean enteros positivos.
 */
export const preprocesarEnteroPositivo = (valor: unknown) => {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const num = typeof valor === 'string' ? Number(valor) : valor;
  return Number.isInteger(num) && (num as number) > 0 ? num : valor;
};

/**
 * Esquema reutilizable para URLs opcionales (http / https) con longitud máxima y normalización de null/vacío.
 */
export const urlOpcional = z.preprocess(
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
