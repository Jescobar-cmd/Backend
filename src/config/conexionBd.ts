import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { entorno } from './entorno';

// Singleton de conexión: una sola instancia para todo el backend.
// Prisma 7 requiere pasar el adaptador de conexión explícitamente.
const adapter = new PrismaPg({
  connectionString: entorno.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
