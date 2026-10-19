import 'dotenv/config';
import { createApp } from './app';
import { prisma } from '../../config/dbconnection';

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

const server = app.listen(port, () => {
  console.log(`FirstGig backend escuchando en el puerto ${port}`);
});

// Factor IX (12-Factor App) - Disposabilidad: apagado elegante ante SIGTERM y SIGINT
const gracefulShutdown = async (signal: string) => {
  console.log(`\nSeñal ${signal} recibida. Iniciando cierre elegante...`);

  server.close(async (err) => {
    if (err) {
      console.error('Error cerrando el servidor HTTP:', err);
      process.exit(1);
    }
    console.log('Servidor HTTP cerrado.');

    try {
      await prisma.$disconnect();
      console.log('Conexión con PostgreSQL cerrada exitosamente.');
      process.exit(0);
    } catch (dbErr) {
      console.error('Error cerrando conexión con la base de datos:', dbErr);
      process.exit(1);
    }
  });

  // Forzar apagado en caso de que alguna conexión quede colgada
  setTimeout(() => {
    console.error('Apagado forzado tras 10 segundos.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
