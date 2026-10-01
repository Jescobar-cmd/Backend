import { z } from 'zod';

const email = z.string().email().max(150);
const password = z.string().min(8).max(72);

// Debe calzar con lo que pide tu pantalla Crear cuenta (toggle + documento + teléfono)
export const registerSchema = z.object({
  nombre: z.string().min(2).max(100),
  apellido: z.string().min(2).max(100),
  email,
  password,
  rolId: z.union([z.literal(2), z.literal(3)]).optional().default(3),
  telefono: z.string().max(20).optional(),
  cedula: z.string().regex(/^[0-9]{6,12}$/).optional(),
});

export const loginSchema = z.object({ email, password: z.string().min(1) });

export const verifyCodeSchema = z.object({
  email,
  code: z.string().regex(/^[0-9]{6}$/),
});

export const resendCodeSchema = z.object({ email });

export const forgotSchema = z.object({ email });

export const resetSchema = z.object({
  code: z.string().regex(/^[0-9]{6}$/),
  email,
  password,
});
