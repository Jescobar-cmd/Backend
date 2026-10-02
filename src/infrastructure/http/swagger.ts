// Documento OpenAPI manual: describe los 10 endpoints de Auth + health.
// Manual (no anotaciones) para que el comité vea exactamente qué recibe y devuelve cada ruta.
export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'FirstGig Backend (Auth — Comité 1)',
    version: '0.1.0',
    description: 'Registro, verificación por código, login, Google, recuperación y perfil.',
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local' },
    { url: 'https://tu-back.onrender.com', description: 'Render (reemplazar por la URL real)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Correo o contraseña incorrectos' } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Salud del servicio',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Crear cuenta (envía código de 6 dígitos al correo)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'apellido', 'email', 'password'],
                properties: {
                  nombre: { type: 'string', example: 'Juan' },
                  apellido: { type: 'string', example: 'Escobar' },
                  email: { type: 'string', format: 'email', example: 'juan@mail.com' },
                  password: { type: 'string', minLength: 8, example: 'Clave1234' },
                  rolId: { type: 'integer', enum: [2, 3], default: 3, description: '2 Freelancer, 3 Cliente' },
                  telefono: { type: 'string', example: '3001234567' },
                  cedula: { type: 'string', example: '1234567890', description: 'Obligatoria si rolId es 2' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Cuenta creada, código enviado' },
          '400': { description: 'Datos inválidos o correo duplicado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/verify-code': {
      post: {
        summary: 'Confirmar cuenta con el código del correo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  code: { type: 'string', pattern: '^[0-9]{6}$', example: '482913' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Cuenta activada' },
          '400': { description: 'Código inválido o vencido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/resend-code': {
      post: {
        summary: 'Reenviar código de verificación',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } },
            },
          },
        },
        responses: { '200': { description: 'Código reenviado (si aplica)' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Iniciar sesión (devuelve JWT)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Sesión iniciada: { token, rol, nombre }' },
          '401': { description: 'Credenciales malas o cuenta sin confirmar', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/google': {
      post: {
        summary: 'Entrar o registrarse con Google (idToken del botón GIS)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string', description: 'Credencial que entrega el botón de Google' },
                  rolId: { type: 'integer', enum: [2, 3], default: 3 },
                  telefono: { type: 'string' },
                  cedula: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Sesión iniciada: { token, rol, nombre }' },
          '202': { description: 'Falta completar perfil: { needsOnboarding: true, email }' },
        },
      },
    },
    '/api/auth/google/complete-profile': {
      post: {
        summary: 'Completar rol + cédula de cuenta Google pendiente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken', 'rolId'],
                properties: {
                  idToken: { type: 'string' },
                  rolId: { type: 'integer', enum: [2, 3] },
                  telefono: { type: 'string' },
                  cedula: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Perfil completo, sesión iniciada' },
          '400': { description: 'Cuenta no encontrada o ya activa' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Pedir código de recuperación (respuesta genérica)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } },
            },
          },
        },
        responses: { '200': { description: 'Si existe, código enviado' } },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Fijar nueva contraseña con el código',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  code: { type: 'string', pattern: '^[0-9]{6}$' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Contraseña actualizada' },
          '400': { description: 'Código inválido o vencido' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Ver mi perfil (requiere JWT)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Datos del usuario' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/auth/me/password': {
      patch: {
        summary: 'Cambiar contraseña con sesión (requiere JWT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Contraseña actualizada' },
          '401': { description: 'Actual incorrecta o sin sesión' },
        },
      },
    },
  },
};
