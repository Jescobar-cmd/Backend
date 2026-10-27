// Documento OpenAPI manual: describe los 10 endpoints de Auth + health.
// Manual (no anotaciones) para que el comité vea exactamente qué recibe y devuelve cada ruta.
export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'FirstGig Backend',
    version: '0.5.0',
    description: 'Auth (registro, verificación, login, Google, recuperación) + Perfil de cliente + Ofertas (proyectos) + Categorías + Blog + Servicios + Feed por rol.',
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
  },
};
