import { z } from 'zod';

const email = z
  .string({ required_error: 'El correo electrónico es requerido' })
  .trim()
  .email('El correo electrónico no es válido')
  .max(150, 'El correo no puede exceder 150 caracteres');

const password = z
  .string({ required_error: 'La contraseña es requerida' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede exceder 72 caracteres');

export const registerSchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre es requerido' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    apellido: z
      .string({ required_error: 'El apellido es requerido' })
      .trim()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(100, 'El apellido no puede exceder 100 caracteres'),
    email,
    password,
    rolId: z.union([z.literal(2), z.literal(3)]).optional().default(3),
    telefono: z
      .string()
      .trim()
      .max(20, 'El teléfono no puede exceder 20 caracteres')
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
    cedula: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .superRefine((data, ctx) => {
    if (data.rolId === 2) {
      if (!data.cedula) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La cédula es obligatoria para freelancers',
          path: ['cedula'],
        });
      } else if (!/^[0-9]{6,12}$/.test(data.cedula)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La cédula debe contener entre 6 y 12 dígitos numéricos',
          path: ['cedula'],
        });
      }
    } else if (data.cedula && !/^[0-9]{6,12}$/.test(data.cedula)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La cédula debe contener entre 6 y 12 dígitos numéricos',
        path: ['cedula'],
      });
    }
  });

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'La contraseña es requerida' }).min(1, 'La contraseña es requerida'),
});

export const verifyCodeSchema = z.object({
  email,
  code: z
    .string({ required_error: 'El código es requerido' })
    .trim()
    .regex(/^[0-9]{6}$/, 'El código debe tener exactamente 6 dígitos numéricos'),
});

export const resendCodeSchema = z.object({
  email,
});

export const forgotSchema = z.object({
  email,
});

export const resetSchema = z.object({
  email,
  code: z
    .string({ required_error: 'El código es requerido' })
    .trim()
    .regex(/^[0-9]{6}$/, 'El código debe tener exactamente 6 dígitos numéricos'),
  password,
});

const cedulaOpt = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((val) => (val && val.length > 0 ? val : null));

export const googleSchema = z.object({
  idToken: z.string({ required_error: 'El token de Google es requerido' }).min(10),
  rolId: z.union([z.literal(2), z.literal(3)]).optional().default(3),
  telefono: z.string().trim().max(20).optional().nullable(),
  cedula: cedulaOpt,
});

export const completeGoogleProfileSchema = z.object({
  idToken: z.string({ required_error: 'El token de Google es requerido' }).min(10),
  rolId: z.union([z.literal(2), z.literal(3)]),
  telefono: z.string().trim().max(20).optional().nullable(),
  cedula: cedulaOpt,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'La contraseña actual es requerida' }).min(1),
  newPassword: password,
});
