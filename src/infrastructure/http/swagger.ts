// Documento OpenAPI manual: describe los 10 endpoints de Auth + health.
// Manual (no anotaciones) para que el comité vea exactamente qué recibe y devuelve cada ruta.
export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'FirstGig Backend',
    version: '1.0.0',
    description:
      'Auth + Perfil cliente/freelancer + Habilidades + Ofertas + Categorías + Blog + Servicios + Feed por rol + Chat (polling) + Propuestas, ofertas de chat, contratos, entregas, disputas, pagos, liquidaciones, notificaciones, cierre y calificaciones + Portafolio, directorio, métricas y dashboards de cliente y freelancer.',
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local' },
    { url: 'https://backend-2n7n.onrender.com', description: 'Render (producción)' },
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
    '/api/cliente/perfil': {
      get: {
        summary: 'Ver mi perfil de cliente (requiere JWT + rol Cliente)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Perfil propio: { id, nombre, email, telefono, fotoPerfil, rol, estado, cliente }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Cliente' },
        },
      },
      patch: {
        summary: 'Editar mi perfil de cliente (requiere JWT + rol Cliente)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Envía solo los campos a cambiar. fotoPerfil es la URL que devuelve Cloudinary.',
                properties: {
                  nombre: { type: 'string', example: 'Juan Escobar' },
                  telefono: { type: 'string', nullable: true, example: '3001234567' },
                  fotoPerfil: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/demo/image/upload/v1/foto.jpg' },
                  descripcion: { type: 'string', nullable: true, example: 'Empresa de desarrollo web' },
                  nombreEmpresa: { type: 'string', nullable: true, example: 'FirstGig SAS' },
                  tipoCliente: { type: 'string', enum: ['natural', 'empresa'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Perfil actualizado: { mensaje, perfil }' },
          '400': { description: 'Datos inválidos o campo no permitido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Cliente' },
        },
      },
    },
    '/api/usuarios/{id}': {
      get: {
        summary: 'Ver perfil público de un usuario (requiere JWT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          '200': { description: 'Perfil público (sin email ni teléfono): { id, nombre, fotoPerfil, rol, cliente, freelancer }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '404': { description: 'Usuario no encontrado' },
        },
      },
    },
    '/api/cliente/ofertas': {
      post: {
        summary: 'Publicar una oferta/proyecto (requiere JWT + rol Cliente)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo', 'descripcion'],
                properties: {
                  titulo: { type: 'string', example: 'Página web para mi negocio' },
                  descripcion: { type: 'string', example: 'Necesito una landing page con formulario de contacto.' },
                  presupuesto: { type: 'number', nullable: true, example: 500 },
                  plazoDias: { type: 'integer', nullable: true, example: 15 },
                  categoriaId: { type: 'integer', nullable: true, example: 1 },
                  imagenUrl: { type: 'string', nullable: true, description: 'URL que devuelve Cloudinary' },
                  habilidadIds: { type: 'array', items: { type: 'integer' }, example: [1, 2] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Oferta publicada: { mensaje, oferta }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Cliente' },
          '422': { description: 'Datos inválidos' },
        },
      },
      get: {
        summary: 'Listar mis ofertas (requiere JWT + rol Cliente)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['abierto', 'en_progreso', 'completado', 'cancelado'] } },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Busca en título y descripción' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': { description: 'Paginado: { page, limit, total, items }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Cliente' },
        },
      },
    },
    '/api/cliente/ofertas/{id}': {
      get: {
        summary: 'Ver el detalle de una oferta mía',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Oferta con categoría, habilidades y totalPropuestas' },
          '400': { description: 'Id inválido' },
          '404': { description: 'Oferta no encontrada' },
        },
      },
      patch: {
        summary: 'Editar una oferta mía (solo si está abierta)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Envía solo los campos a cambiar.',
                properties: {
                  titulo: { type: 'string' },
                  descripcion: { type: 'string' },
                  presupuesto: { type: 'number', nullable: true },
                  plazoDias: { type: 'integer', nullable: true },
                  categoriaId: { type: 'integer', nullable: true },
                  imagenUrl: { type: 'string', nullable: true },
                  habilidadIds: { type: 'array', items: { type: 'integer' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Oferta actualizada' },
          '404': { description: 'Oferta no encontrada' },
          '409': { description: 'La oferta no está abierta' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/cliente/ofertas/{id}/estado': {
      patch: {
        summary: 'Abrir / poner en progreso / completar / cancelar una oferta (sin borrado físico)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['estado'],
                properties: { estado: { type: 'string', enum: ['abierto', 'en_progreso', 'completado', 'cancelado'] } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Estado actualizado' },
          '404': { description: 'Oferta no encontrada' },
          '422': { description: 'Estado inválido' },
        },
      },
    },
    '/api/cliente/ofertas/{id}/propuestas': {
      get: {
        summary: 'Ver las propuestas recibidas en una oferta mía',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ total, propuestas }' },
          '404': { description: 'Oferta no encontrada' },
        },
      },
    },
    '/api/categorias': {
      get: {
        summary: 'Catálogo de categorías (requiere JWT)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ total, categorias }' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/publicaciones': {
      post: {
        summary: 'Publicar en el blog (requiere JWT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['contenido'],
                properties: {
                  titulo: { type: 'string', nullable: true, example: 'Mi primer proyecto' },
                  contenido: { type: 'string', example: 'Hoy terminé una landing page...' },
                  imagenUrl: {
                    type: 'string',
                    nullable: true,
                    description: 'URL que devuelve Cloudinary',
                    example: 'https://res.cloudinary.com/demo/image/upload/v1/blog.jpg',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Publicación creada: { mensaje, publicacion }' },
          '401': { description: 'Sin sesión o expirada' },
          '422': { description: 'Datos inválidos' },
        },
      },
      get: {
        summary: 'Listar el blog (requiere JWT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'autorId', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por autor' },
        ],
        responses: {
          '200': { description: 'Paginado: { page, limit, total, items }' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/publicaciones/{id}': {
      get: {
        summary: 'Ver una publicación del blog',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Publicación con autor y likes' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '404': { description: 'Publicación no encontrada' },
        },
      },
      delete: {
        summary: 'Eliminar una publicación (borrado lógico; autor o admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Publicación eliminada' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No es el autor ni admin' },
          '404': { description: 'Publicación no encontrada' },
        },
      },
    },
    '/api/publicaciones/{id}/like': {
      post: {
        summary: 'Dar o quitar me gusta (toggle)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ meGusta, totalLikes }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '404': { description: 'Publicación no encontrada' },
        },
      },
    },
    '/api/servicios': {
      post: {
        summary: 'Publicar un servicio (requiere JWT + rol Freelancer)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo', 'descripcion', 'precio'],
                properties: {
                  titulo: { type: 'string', example: 'Landing page profesional' },
                  descripcion: { type: 'string', example: 'Diseño y desarrollo una landing page responsive.' },
                  precio: { type: 'number', example: 150 },
                  categoriaId: { type: 'integer', nullable: true, example: 5 },
                  imagenUrl: { type: 'string', nullable: true, description: 'URL que devuelve Cloudinary' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Servicio creado: { mensaje, servicio }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Freelancer' },
          '422': { description: 'Datos inválidos' },
        },
      },
      get: {
        summary: 'Catálogo de servicios activos (requiere JWT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'categoriaId', in: 'query', schema: { type: 'integer' } },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Busca en título y descripción' },
        ],
        responses: {
          '200': { description: 'Paginado: { page, limit, total, items }' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/servicios/{id}': {
      get: {
        summary: 'Ver el detalle de un servicio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Servicio con categoría y datos del freelancer' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '404': { description: 'Servicio no encontrado' },
        },
      },
      patch: {
        summary: 'Editar un servicio propio (Freelancer)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Envía solo los campos a cambiar.',
                properties: {
                  titulo: { type: 'string' },
                  descripcion: { type: 'string' },
                  precio: { type: 'number' },
                  categoriaId: { type: 'integer', nullable: true },
                  imagenUrl: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Servicio actualizado' },
          '400': { description: 'Id o categoría inválidos' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No es el dueño del servicio' },
          '404': { description: 'Servicio no encontrado' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/servicios/{id}/estado': {
      patch: {
        summary: 'Activar / pausar / eliminar un servicio propio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['estado'],
                properties: { estado: { type: 'string', enum: ['activo', 'pausado', 'eliminado'] } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Estado actualizado' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No es el dueño del servicio' },
          '404': { description: 'Servicio no encontrado' },
          '422': { description: 'Estado inválido' },
        },
      },
    },
    '/api/freelancer/servicios': {
      get: {
        summary: 'Mis servicios (requiere JWT + rol Freelancer)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['activo', 'pausado', 'eliminado'] } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginado: { page, limit, total, items }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Freelancer' },
        },
      },
    },
    '/api/feed': {
      get: {
        summary: 'Feed de inicio según el rol (requiere JWT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Ítems por sección (máx. 30)' },
        ],
        responses: {
          '200': {
            description:
              'Cliente: { rol, publicaciones, ofertas: [], servicios }. Freelancer: { rol, publicaciones, ofertas, servicios }',
          },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/ofertas': {
      get: {
        summary: 'Marketplace de ofertas abiertas (requiere JWT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'categoriaId', in: 'query', schema: { type: 'integer' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginado: { page, limit, total, items } con datos del cliente' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/ofertas/{id}': {
      get: {
        summary: 'Detalle público de una oferta abierta',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Oferta con cliente, categoría, habilidades y totalPropuestas' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '404': { description: 'Oferta no encontrada o ya no está abierta' },
        },
      },
    },
    '/api/conversaciones': {
      post: {
        summary: 'Iniciar o recuperar una conversación (requiere JWT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description:
                  'Cliente: { servicioId } o { proyectoId, freelancerId }. Freelancer: { proyectoId }.',
                properties: {
                  servicioId: { type: 'integer', example: 1 },
                  proyectoId: { type: 'integer', example: 1 },
                  freelancerId: { type: 'integer', example: 2 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: '{ mensaje, conversacion } (idempotente)' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'La oferta no te pertenece o el rol no puede iniciar chat' },
          '404': { description: 'Servicio, oferta o freelancer no encontrado' },
          '422': { description: 'Combinación de datos inválida' },
        },
      },
      get: {
        summary: 'Mis conversaciones (requiere JWT)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ total, conversaciones } con último mensaje y noLeidos' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/conversaciones/{id}': {
      get: {
        summary: 'Detalle de una conversación propia',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Conversación con participantes y contexto' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en la conversación' },
          '404': { description: 'Conversación no encontrada' },
        },
      },
    },
    '/api/conversaciones/{id}/mensajes': {
      get: {
        summary: 'Polling de mensajes nuevos (afterId)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'afterId', in: 'query', schema: { type: 'integer' }, description: 'Devuelve solo mensajes con id > afterId' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          '200': { description: '{ mensajes, ultimoId }' },
          '400': { description: 'Id o afterId inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en la conversación' },
          '404': { description: 'Conversación no encontrada' },
        },
      },
      post: {
        summary: 'Enviar un mensaje de texto',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['contenido'],
                properties: { contenido: { type: 'string', example: 'Hola, me interesa tu servicio' } },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Mensaje creado' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en la conversación' },
          '404': { description: 'Conversación no encontrada' },
          '422': { description: 'Mensaje vacío o demasiado largo' },
        },
      },
    },
    '/api/conversaciones/{id}/leido': {
      patch: {
        summary: 'Marcar como leídos los mensajes del otro participante',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ mensaje, actualizados }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en la conversación' },
          '404': { description: 'Conversación no encontrada' },
        },
      },
    },
    '/api/ofertas/{id}/propuestas': {
      post: {
        summary: 'Enviar una propuesta a una oferta (Freelancer)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['montoPropuesto'],
                properties: {
                  mensaje: { type: 'string', nullable: true, example: 'Puedo entregarlo en 5 días.' },
                  montoPropuesto: { type: 'number', example: 250 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: '{ mensaje, propuesta }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Freelancer' },
          '404': { description: 'Oferta no encontrada' },
          '409': { description: 'La oferta no está abierta o ya enviaste una propuesta' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/freelancer/propuestas': {
      get: {
        summary: 'Mis propuestas enviadas (Freelancer)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ total, propuestas } con datos del proyecto' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Freelancer' },
        },
      },
    },
    '/api/cliente/ofertas/{id}/propuestas/{propuestaId}/aceptar': {
      post: {
        summary: 'Aceptar una propuesta y crear el contrato (Cliente)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'propuestaId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: '{ mensaje, contrato }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'La oferta no te pertenece' },
          '404': { description: 'Propuesta no encontrada' },
          '409': { description: 'La propuesta ya fue procesada o la oferta no está abierta' },
        },
      },
    },
    '/api/cliente/ofertas/{id}/propuestas/{propuestaId}/rechazar': {
      post: {
        summary: 'Rechazar una propuesta (Cliente)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'propuestaId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: '{ mensaje }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'La oferta no te pertenece' },
          '404': { description: 'Propuesta no encontrada' },
          '409': { description: 'La propuesta ya fue procesada' },
        },
      },
    },
    '/api/conversaciones/{id}/ofertas': {
      post: {
        summary: 'Enviar una oferta de monto en el chat',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['monto'],
                properties: {
                  monto: { type: 'number', example: 300 },
                  descripcion: { type: 'string', nullable: true },
                  fechaExpiracion: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Mensaje tipo oferta con su OfertaChat' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en la conversación' },
          '404': { description: 'Conversación no encontrada' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/ofertas-chat/{id}/aceptar': {
      post: {
        summary: 'Aceptar una oferta de chat y crear el contrato',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ mensaje, contrato }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas o intentas aceptar tu propia oferta' },
          '404': { description: 'Oferta no encontrada' },
          '409': { description: 'La oferta no está pendiente o expiró' },
        },
      },
    },
    '/api/ofertas-chat/{id}/rechazar': {
      post: {
        summary: 'Rechazar una oferta de chat',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ mensaje }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas o intentas rechazar tu propia oferta' },
          '404': { description: 'Oferta no encontrada' },
          '409': { description: 'La oferta no está pendiente' },
        },
      },
    },
    '/api/ofertas-chat/{id}/contraoferta': {
      post: {
        summary: 'Responder con una contraoferta',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['monto'],
                properties: {
                  monto: { type: 'number', example: 260 },
                  descripcion: { type: 'string', nullable: true },
                  fechaExpiracion: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Mensaje con la contraoferta pendiente' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas o intentas contraofertar tu propia oferta' },
          '404': { description: 'Oferta no encontrada' },
          '409': { description: 'La oferta no está pendiente o expiró' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/contratos': {
      get: {
        summary: 'Mis contratos (Cliente o Freelancer)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ total, contratos } con contexto y contraparte' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/contratos/{id}': {
      get: {
        summary: 'Detalle de un contrato propio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Contrato con contexto y contraparte' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en el contrato' },
          '404': { description: 'Contrato no encontrado' },
        },
      },
    },
    '/api/cliente/dashboard': {
      get: {
        summary: 'Dashboard del cliente',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description:
              'Resumen de contratos, entregas, disputas, pagos, total pagado, notificaciones y contratos recientes',
          },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol cliente' },
        },
      },
    },
    '/api/cliente/servicios/{id}/contratar': {
      post: {
        summary: 'Contratar directamente un servicio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '201': {
            description:
              'Contrato creado con pago pendiente. El pago incluye la comisión de servicio al cliente (3% por defecto).',
          },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol cliente' },
          '404': { description: 'Servicio no encontrado' },
          '409': { description: 'Servicio no disponible, propio o ya contratado' },
        },
      },
    },
    '/api/cliente/pagos': {
      get: {
        summary: 'Listar mis pagos y facturas',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ total, pagos } con contrato y factura' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol cliente' },
        },
      },
    },
    '/api/cliente/pagos/{id}/factura': {
      get: {
        summary: 'Consultar la factura de un pago propio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Factura del pago' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol cliente' },
          '404': { description: 'Factura no encontrada' },
        },
      },
    },
    '/api/cliente/notificaciones': {
      get: {
        summary: 'Listar mis notificaciones',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } },
          { name: 'soloNoLeidas', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: {
          '200': { description: '{ page, limit, total, noLeidas, items }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol cliente' },
        },
      },
    },
    '/api/cliente/notificaciones/leidas': {
      patch: {
        summary: 'Marcar todas mis notificaciones como leídas',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ actualizadas }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol cliente' },
        },
      },
    },
    '/api/cliente/notificaciones/{id}/leida': {
      patch: {
        summary: 'Marcar una notificación como leída',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Notificación actualizada' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol cliente' },
          '404': { description: 'Notificación no encontrada' },
        },
      },
    },
    '/api/contratos/{id}/entregas': {
      get: {
        summary: 'Listar entregas de un contrato propio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ total, entregas }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en el contrato' },
          '404': { description: 'Contrato no encontrado' },
        },
      },
      post: {
        summary: 'Registrar la entrega de un contrato (freelancer)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  mensaje: { type: 'string', nullable: true },
                  archivoUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/...' },
                  enlaceUrl: { type: 'string', nullable: true, example: 'https://drive.google.com/...' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Entrega registrada' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer y participación' },
          '404': { description: 'Contrato no encontrado' },
          '409': { description: 'Contrato inactivo o entrega pendiente existente' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/contratos/{id}/entregas/{entregaId}': {
      patch: {
        summary: 'Reemplazar una entrega en revisión (freelancer)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'entregaId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  mensaje: { type: 'string', nullable: true },
                  archivoUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/...' },
                  enlaceUrl: { type: 'string', nullable: true, example: 'https://drive.google.com/...' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Entrega actualizada y cliente notificado' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No eres el freelancer del contrato o autor de la entrega' },
          '404': { description: 'Contrato o entrega no encontrada' },
          '409': { description: 'Contrato inactivo o entrega ya revisada' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/contratos/{id}/aprobar-entrega': {
      patch: {
        summary: 'Aprobar la entrega y completar el contrato (cliente)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Entrega aprobada y contrato completado' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No eres el cliente del contrato' },
          '404': { description: 'Contrato no encontrado' },
          '409': { description: 'Contrato inactivo o sin entrega pendiente' },
        },
      },
    },
    '/api/contratos/{id}/rechazar-entrega': {
      patch: {
        summary: 'Rechazar una entrega y dejar observaciones (cliente)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['observacion'],
                properties: {
                  observacion: { type: 'string', minLength: 3, maxLength: 1000, example: 'Falta el footer y el responsive móvil.' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Entrega rechazada y freelancer notificado' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No eres el cliente del contrato' },
          '404': { description: 'Contrato no encontrado' },
          '409': { description: 'Contrato inactivo o sin entrega pendiente' },
          '422': { description: 'Observación inválida' },
        },
      },
    },
    '/api/contratos/{id}/disputas': {
      get: {
        summary: 'Listar disputas de un contrato propio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ total, disputas }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en el contrato' },
          '404': { description: 'Contrato no encontrado' },
        },
      },
      post: {
        summary: 'Abrir una disputa formal sobre un contrato activo',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['motivo', 'descripcion'],
                properties: {
                  motivo: { type: 'string', example: 'Entrega incompleta' },
                  descripcion: { type: 'string', example: 'Faltan dos pantallas del diseño acordado.' },
                  evidenciaUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/...' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Disputa abierta' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en el contrato' },
          '404': { description: 'Contrato no encontrado' },
          '409': { description: 'Contrato inactivo o disputa abierta existente' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/freelancer/perfil': {
      get: {
        summary: 'Perfil propio del freelancer',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Perfil con email, teléfono, título, biografía, habilidades, portafolio, servicios y reseñas' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Freelancer' },
          '404': { description: 'Perfil no encontrado' },
        },
      },
      patch: {
        summary: 'Actualizar perfil del freelancer',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Ana Pérez' },
                  telefono: { type: 'string', nullable: true, example: '+57 300 123 4567' },
                  fotoPerfil: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/...' },
                  tituloProfesional: { type: 'string', nullable: true, example: 'Desarrolladora full stack' },
                  biografia: { type: 'string', nullable: true, example: 'Especialista en React y Node.js' },
                  habilidades: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id'],
                      properties: {
                        id: { type: 'integer', example: 1 },
                        nivel: {
                          type: 'string',
                          nullable: true,
                          enum: ['basico', 'intermedio', 'avanzado', 'experto'],
                        },
                      },
                    },
                  },
                  habilidadIds: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Perfil actualizado' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El usuario no es Freelancer' },
          '404': { description: 'Perfil no encontrado' },
          '422': { description: 'Datos inválidos o habilidades inexistentes' },
        },
      },
    },
    '/api/habilidades': {
      get: {
        summary: 'Catálogo de habilidades',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ total, habilidades } con categoría' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/contratos/{id}/estado': {
      patch: {
        summary: 'Completar o cancelar un contrato propio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['estado'],
                properties: {
                  estado: { type: 'string', enum: ['completado', 'cancelado'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Contrato cerrado y oferta sincronizada' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en el contrato' },
          '404': { description: 'Contrato no encontrado' },
          '409': { description: 'El contrato ya no está activo' },
          '422': { description: 'Estado inválido' },
        },
      },
    },
    '/api/contratos/{id}/calificaciones': {
      get: {
        summary: 'Calificaciones de un contrato propio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ total, calificaciones, miCalificacion }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en el contrato' },
          '404': { description: 'Contrato no encontrado' },
        },
      },
      post: {
        summary: 'Calificar a la otra parte de un contrato completado',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['puntuacion'],
                properties: {
                  puntuacion: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  comentario: { type: 'string', nullable: true, example: 'Excelente trabajo' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Calificación registrada' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'No participas en el contrato' },
          '404': { description: 'Contrato no encontrado' },
          '409': { description: 'El contrato no está completado o ya calificaste' },
          '422': { description: 'Puntuación o comentario inválidos' },
        },
      },
    },
    '/api/freelancer/portafolio': {
      get: {
        summary: 'Listar mi portafolio',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ total, items }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
        },
      },
      post: {
        summary: 'Agregar un ítem a mi portafolio',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo'],
                properties: {
                  titulo: { type: 'string', example: 'Landing page para startup' },
                  descripcion: { type: 'string', nullable: true },
                  imagenUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/...' },
                  enlaceUrl: { type: 'string', nullable: true, example: 'https://mi-proyecto.com' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Ítem creado' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/freelancer/portafolio/{id}': {
      patch: {
        summary: 'Editar un ítem de mi portafolio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Ítem actualizado' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El ítem no es tuyo' },
          '404': { description: 'Ítem no encontrado' },
          '422': { description: 'Datos inválidos' },
        },
      },
      delete: {
        summary: 'Eliminar un ítem de mi portafolio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Ítem eliminado' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'El ítem no es tuyo' },
          '404': { description: 'Ítem no encontrado' },
        },
      },
    },
    '/api/freelancer/propuestas/{id}/retirar': {
      patch: {
        summary: 'Retirar una propuesta pendiente propia',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Propuesta retirada' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'La propuesta no es tuya' },
          '404': { description: 'Propuesta no encontrada' },
          '409': { description: 'La propuesta ya no está pendiente' },
        },
      },
    },
    '/api/freelancer/estadisticas': {
      get: {
        summary: 'Métricas diarias de mi perfil y propuestas',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'desde', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'hasta', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: '{ totalVisitasPerfil, totalVisualizacionesPropuesta, dias }' },
          '400': { description: 'Rango de fechas inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
        },
      },
    },
    '/api/freelancer/notificaciones': {
      get: {
        summary: 'Listar mis notificaciones (freelancer)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } },
          { name: 'soloNoLeidas', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: {
          '200': { description: '{ total, pagina, limite, notificaciones, sinLeer }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
        },
      },
    },
    '/api/freelancer/notificaciones/leidas': {
      patch: {
        summary: 'Marcar todas mis notificaciones como leídas (freelancer)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ actualizadas }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
        },
      },
    },
    '/api/freelancer/notificaciones/{id}/leida': {
      patch: {
        summary: 'Marcar una notificación como leída (freelancer)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Notificación actualizada' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
          '404': { description: 'Notificación no encontrada' },
        },
      },
    },
    '/api/freelancer/pagos': {
      get: {
        summary: 'Listar mis pagos y facturas (freelancer)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '{ total, pagos } con contrato, cliente y factura' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
        },
      },
    },
    '/api/freelancer/pagos/{id}/factura': {
      get: {
        summary: 'Consultar la factura de un pago propio (freelancer)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Factura del pago' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
          '404': { description: 'Factura no encontrada' },
        },
      },
    },
    '/api/freelancer/liquidaciones': {
      get: {
        summary: 'Consultar saldo, comisiones e historial de liquidaciones',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description:
              '{ resumen: { saldoDisponible, saldoEnProceso, totalPagado, comisionTotal, totalLiquidaciones }, liquidaciones }. La comisión del freelancer es 12% por defecto (15% total menos 3% del cliente).',
          },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
        },
      },
    },
    '/api/freelancer/liquidaciones/solicitar': {
      post: {
        summary: 'Solicitar el retiro de las liquidaciones disponibles',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: '{ mensaje, cantidad, total }' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
          '409': { description: 'No hay saldo disponible para retirar' },
        },
      },
    },
    '/api/freelancer/dashboard': {
      get: {
        summary: 'Resumen del panel del freelancer',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description:
              'Contadores de contratos, propuestas, servicios, entregas, pagos, disputas, notificaciones, reputación, métricas y saldo disponible',
          },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol freelancer' },
        },
      },
    },
    '/api/usuarios/{id}/portafolio': {
      get: {
        summary: 'Ver el portafolio público de un freelancer',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: '{ total, items }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/usuarios/{id}/calificaciones': {
      get: {
        summary: 'Ver las calificaciones públicas de un freelancer',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: {
          '200': { description: '{ total, calificaciones }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/usuarios/{id}/servicios': {
      get: {
        summary: 'Ver los servicios activos de un freelancer',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: {
          '200': { description: '{ page, limit, total, items }' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/freelancers': {
      get: {
        summary: 'Directorio y búsqueda de freelancers',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'habilidadId', in: 'query', schema: { type: 'integer' } },
          { name: 'categoriaId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: '{ page, limit, total, items }' },
          '400': { description: 'Filtro inválido' },
          '401': { description: 'Sin sesión o expirada' },
        },
      },
    },
    '/api/reportes': {
      post: {
        summary: 'Crear un reporte de usuario o proyecto (cualquier rol autenticado)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['motivo'],
                properties: {
                  usuarioReportadoId: { type: 'integer', example: 8 },
                  proyectoId: { type: 'integer', example: 12 },
                  motivo: { type: 'string', minLength: 3, maxLength: 100, example: 'Spam' },
                  descripcion: { type: 'string', maxLength: 1000, example: 'Envía enlaces maliciosos en los mensajes.' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Reporte creado' },
          '401': { description: 'Sin sesión o expirada' },
          '409': { description: 'No puedes reportarte a ti mismo' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/moderador/dashboard': {
      get: {
        summary: 'Resumen de moderación (admin o moderador)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description:
              '{ reportesPendientes, disputasAbiertas, retirosPendientes }',
          },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
        },
      },
    },
    '/api/moderador/reportes': {
      get: {
        summary: 'Listar reportes (admin o moderador)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['pendiente', 'resuelto', 'rechazado'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: {
          '200': { description: '{ total, reportes }' },
          '400': { description: 'Filtro inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
        },
      },
    },
    '/api/moderador/reportes/{id}': {
      get: {
        summary: 'Consultar un reporte (admin o moderador)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Reporte con datos del reportante, reportado y proyecto' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
          '404': { description: 'Reporte no encontrado' },
        },
      },
    },
    '/api/moderador/reportes/{id}/resolver': {
      patch: {
        summary: 'Resolver un reporte (admin o moderador)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resolucion'],
                properties: {
                  estado: { type: 'string', enum: ['resuelto', 'rechazado'], default: 'resuelto' },
                  resolucion: { type: 'string', minLength: 3, maxLength: 1000, example: 'Contenido ha sido moderado.' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Reporte resuelto' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
          '404': { description: 'Reporte no encontrado' },
          '409': { description: 'El reporte ya fue gestionado' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/moderador/disputas': {
      get: {
        summary: 'Listar disputas (admin o moderador)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['abierta', 'en_revision', 'resuelta', 'rechazada'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: {
          '200': { description: '{ total, disputas }' },
          '400': { description: 'Filtro inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
        },
      },
    },
    '/api/moderador/disputas/{id}': {
      get: {
        summary: 'Consultar una disputa (admin o moderador)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Disputa con los datos del contrato y sus partes' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
          '404': { description: 'Disputa no encontrada' },
        },
      },
    },
    '/api/moderador/disputas/{id}/resolver': {
      patch: {
        summary: 'Resolver una disputa (admin o moderador)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['estado', 'resolucion'],
                properties: {
                  estado: { type: 'string', enum: ['resuelta', 'rechazada'] },
                  resolucion: { type: 'string', minLength: 3, maxLength: 1000, example: 'Cliente prevalece.' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Disputa resuelta' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
          '404': { description: 'Disputa no encontrada' },
          '409': { description: 'La disputa ya no está abierta' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
    '/api/moderador/liquidaciones': {
      get: {
        summary: 'Listar liquidaciones administrativamente',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['pendiente', 'solicitada', 'pagada', 'rechazada'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: {
          '200': { description: '{ total, liquidaciones }' },
          '400': { description: 'Filtro inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
        },
      },
    },
    '/api/moderador/liquidaciones/{id}/pagar': {
      patch: {
        summary: 'Aprobar o rechazar el pago de un retiro (admin o moderador)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  estado: { type: 'string', enum: ['pagada', 'rechazada'], default: 'pagada' },
                  referencia: { type: 'string', nullable: true, example: 'MP-SIM-RET-001' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Retiro pagado o rechazado según el estado enviado' },
          '400': { description: 'Id inválido' },
          '401': { description: 'Sin sesión o expirada' },
          '403': { description: 'Requiere rol admin o moderador' },
          '404': { description: 'Liquidación no encontrada' },
          '409': { description: 'La liquidación no está en solicitud de retiro' },
          '422': { description: 'Datos inválidos' },
        },
      },
    },
  },
};
