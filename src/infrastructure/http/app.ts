import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { authRouter } from './routes/auth.routes';
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

  // Swagger UI + JSON crudo (para importar la colección en Postman)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as object));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));

  app.use(errorHandler);

  return app;
}
