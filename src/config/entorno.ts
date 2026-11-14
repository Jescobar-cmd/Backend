import 'dotenv/config';
import { z } from 'zod';

const esquemaEntorno = z.object({
  PORT: z
    .string()
    .optional()
    .default('4000')
    .transform((valor) => {
      const puerto = Number(valor);
      if (Number.isNaN(puerto) || puerto <= 0 || puerto > 65535) return 4000;
      return puerto;
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  DATABASE_URL: z
    .string({ required_error: 'Falta la variable DATABASE_URL en el entorno' })
    .min(1, 'DATABASE_URL no puede estar vacía'),
  JWT_SECRET: z
    .string({ required_error: 'Falta la variable JWT_SECRET en el entorno' })
    .min(8, 'JWT_SECRET debe tener al menos 8 caracteres para garantizar seguridad'),
  JWT_EXPIRES_IN: z.string().optional().default('24h'),
  FRONTEND_URL: z.string().optional().default('http://localhost:5173'),
  SWAGGER_SERVER_URL: z.string().optional(),

  // Proveedor de correo: Brevo HTTP API
  BREVO_API_KEY: z.string().optional(),
  BREVO_API_URL: z.string().optional().default('https://api.brevo.com/v3/smtp/email'),
  EMAIL_PROVIDER: z.enum(['brevo', 'smtp']).optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_FROM_NAME: z.string().optional().default('FirstGig'),

  // Proveedor de correo: SMTP / Gmail
  SMTP_HOST: z.string().optional().default('smtp.gmail.com'),
  SMTP_PORT: z
    .string()
    .optional()
    .default('587')
    .transform((val) => Number(val) || 587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('FirstGig <no-reply@firstgig.com>'),

  // Autenticación con Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Comision total de la plataforma (0-100). Se reparte entre cliente y freelancer.
  COMISION_PLATAFORMA_PORCENTAJE: z
    .string()
    .optional()
    .default('15')
    .transform((valor) => {
      const porcentaje = Number(valor);
      if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100) {
        return 15;
      }
      return porcentaje;
    }),

  // Parte de la comision total que paga el cliente al contratar.
  COMISION_CLIENTE_PORCENTAJE: z
    .string()
    .optional()
    .default('3')
    .transform((valor) => {
      const porcentaje = Number(valor);
      if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100) {
        return 3;
      }
      return porcentaje;
    }),

  // Semilla de base de datos
  SEED_DEMO_USER: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
}).refine(
  (datos) =>
    datos.COMISION_CLIENTE_PORCENTAJE <= datos.COMISION_PLATAFORMA_PORCENTAJE,
  {
    message:
      'COMISION_CLIENTE_PORCENTAJE no puede ser mayor que COMISION_PLATAFORMA_PORCENTAJE',
    path: ['COMISION_CLIENTE_PORCENTAJE'],
  }
);

const resultado = esquemaEntorno.safeParse(process.env);

if (!resultado.success) {
  console.error('❌ Error de configuración de entorno (12-Factor App - Factor III):');
  resultado.error.issues.forEach((issue) => {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  });
  throw new Error('Configuración de entorno inválida. Verifica tu archivo .env.');
}

export const entorno = resultado.data;
export type EntornoConfiguracion = typeof entorno;
