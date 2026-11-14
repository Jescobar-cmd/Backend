import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { autenticacionRouter } from './routes/autenticacion.routes';
import { clienteRouter, usuariosRouter } from './routes/perfil.routes';
import { clienteRolRouter } from './routes/cliente.routes';
import { ofertasRouter } from './routes/oferta.routes';
import { categoriasRouter } from './routes/categoria.routes';
import { publicacionesRouter } from './routes/publicacion.routes';
import { freelancerRouter, serviciosRouter } from './routes/servicio.routes';
import { feedRouter, mercadoRouter } from './routes/feed.routes';
import { conversacionesRouter } from './routes/conversacion.routes';
import { ofertaChatRouter } from './routes/ofertaChat.routes';
import { contratosRouter } from './routes/contrato.routes';
import { habilidadesRouter } from './routes/habilidad.routes';
import { directorioFreelancerRouter } from './routes/directorio.routes';
import { moderadorRouter } from './routes/moderador.routes';
import { reportesRouter } from './routes/reportes.routes';
import { manejadorErrores } from './middlewares/manejadorErrores';
import { entorno } from '../../config/entorno';
import { prisma } from '../../config/conexionBd';

export function createApp() {
  const app = express();

  // Seguridad y hardening HTTP
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: entorno.FRONTEND_URL.split(',').map((origen) => origen.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  // Factor XI (12-Factor App) - Logs como flujo de eventos por stdout
  if (entorno.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
      const inicio = Date.now();
      res.on('finish', () => {
        const duracion = Date.now() - inicio;
        console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duracion}ms`);
      });
      next();
    });
  }

  // Factor IX (12-Factor App) - Healthcheck de vida: no toca servicios externos.
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Factor IV y IX - Readiness: confirma que la base de datos (backing service)
  // responde antes de enviar tráfico real al proceso.
  app.get('/health/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('[Health] La base de datos no responde:', error);
      res.status(503).json({
        status: 'unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Rutas de la API
  app.use('/api/auth', autenticacionRouter);
  app.use('/api/cliente', clienteRouter);
  app.use('/api/cliente', clienteRolRouter);
  app.use('/api/cliente/ofertas', ofertasRouter);
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api/categorias', categoriasRouter);
  app.use('/api/publicaciones', publicacionesRouter);
  app.use('/api/servicios', serviciosRouter);
  app.use('/api/freelancer', freelancerRouter);
  app.use('/api/feed', feedRouter);
  app.use('/api/ofertas', mercadoRouter);
  app.use('/api/conversaciones', conversacionesRouter);
  app.use('/api/ofertas-chat', ofertaChatRouter);
  app.use('/api/contratos', contratosRouter);
  app.use('/api/habilidades', habilidadesRouter);
  app.use('/api/freelancers', directorioFreelancerRouter);
  app.use('/api/moderador', moderadorRouter);
  app.use('/api/reportes', reportesRouter);

  // Documentación OpenAPI / Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as object));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));

  // Manejador centralizado de errores
  app.use(manejadorErrores);

  return app;
}
