import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { autenticacionRouter } from './routes/autenticacion.routes';
import { clienteRouter, usuariosRouter } from './routes/perfil.routes';
import { ofertasRouter } from './routes/oferta.routes';
import { categoriasRouter } from './routes/categoria.routes';
import { publicacionesRouter } from './routes/publicacion.routes';
import { freelancerRouter, serviciosRouter } from './routes/servicio.routes';
import { feedRouter, mercadoRouter } from './routes/feed.routes';
import { conversacionesRouter } from './routes/conversacion.routes';
import { ofertaChatRouter } from './routes/ofertaChat.routes';
import { contratosRouter } from './routes/contrato.routes';
import { habilidadesRouter } from './routes/habilidad.routes';
import { manejadorErrores } from './middlewares/manejadorErrores';
import { entorno } from '../../config/entorno';

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

  // Endpoint de salud (Factor IX - Healthcheck)
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Rutas de la API
  app.use('/api/auth', autenticacionRouter);
  app.use('/api/cliente', clienteRouter);
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

  // Documentación OpenAPI / Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as object));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));

  // Manejador centralizado de errores
  app.use(manejadorErrores);

  return app;
}
