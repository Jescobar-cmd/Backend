import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Singleton: una sola conexión en todo el backend (lee DATABASE_URL del .env).
// Prisma 7 exige pasar el driver adapter explícitamente.
// Los repositorios reciben este cliente por constructor, no lo importan directo.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

export const prisma = new PrismaClient({ adapter });
