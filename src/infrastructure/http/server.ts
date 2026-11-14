import { createApp } from './app';
import { prisma } from '../../config/conexionBd';
import { entorno } from '../../config/entorno';

const port = entorno.PORT;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`FirstGig backend escuchando en el puerto ${port} [entorno: ${entorno.NODE_ENV}]`);
});

// Factor IX: Resiliencia frente a proxies inversos (Render / AWS ALB / Nginx).
// keepAliveTimeout superior al timeout del balanceador (60s) para evitar 502 Bad Gateway.
server.keepAliveTimeout = 61000;
server.headersTimeout = 65000;

// Factor IX (12-Factor App) - Disposabilidad y apagado elegante ante señales del sistema
let cerrando = false;

const gracefulShutdown = async (signal: string, codigoSalida = 0) => {
  if (cerrando) return;
  cerrando = true;

  console.log(`\n[Proceso] Señal ${signal} recibida. Iniciando cierre elegante...`);

  server.close(async (err) => {
    if (err) {
      console.error('[HTTP] Error cerrando el servidor HTTP:', err);
      process.exit(1);
    }
    console.log('[HTTP] Servidor HTTP cerrado correctamente.');

    try {
      await prisma.$disconnect();
      console.log('[DB] Conexión con PostgreSQL cerrada exitosamente.');
      process.exit(codigoSalida);
    } catch (dbErr) {
      console.error('[DB] Error cerrando conexión con la base de datos:', dbErr);
      process.exit(1);
    }
  });

  // Forzar apagado en caso de que alguna conexión quede colgada tras 10s
  setTimeout(() => {
    console.error('[Proceso] Apagado forzado tras 10 segundos de espera.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Factor VI y IX (12-Factor App): los procesos son desechables y no guardan
// estado. Un fallo no controlado debe derribar el proceso para que el
// orquestador lo reinicie en un estado limpio (crash-only design).
process.on('unhandledRejection', (reason) => {
  console.error('[Proceso] Rechazo de promesa no controlado:', reason);
  gracefulShutdown('UNHANDLED_REJECTION', 1);
});

process.on('uncaughtException', (error) => {
  console.error('[Proceso] Excepción no capturada:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION', 1);
});
