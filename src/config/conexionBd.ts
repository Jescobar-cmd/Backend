import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Singleton: una sola conexión en todo el backend (lee DATABASE_URL del .env).
// Prisma 7 exige pasar el driver adapter explícitamente.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Falta la variable DATABASE_URL en las variables de entorno (.env)');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

export const prisma = new PrismaClient({ adapter });
