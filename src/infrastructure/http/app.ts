import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { authRouter } from './routes/auth.routes';
import { clienteRouter, usuariosRouter } from './routes/perfil.routes';
import { ofertasRouter } from './routes/oferta.routes';
import { categoriasRouter } from './routes/categoria.routes';
import { publicacionesRouter } from './routes/publicacion.routes';
import { freelancerRouter, serviciosRouter } from './routes/servicio.routes';
import { feedRouter, mercadoRouter } from './routes/feed.routes';
import { conversacionesRouter } from './routes/conversacion.routes';
import { errorHandler } from './middlewares/errorHandler';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: (process.env.FRONTEND_URL ?? 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim()),
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
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

  // Swagger UI + JSON crudo (para importar la colección en Postman)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as object));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));

  app.use(errorHandler);

  return app;
}
