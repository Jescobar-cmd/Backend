import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { entorno } from './src/config/entorno';

const adapter = new PrismaPg({ connectionString: entorno.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.\$executeRaw`ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "motivoSuspension" TEXT`;
  console.log('1 OK - motivoSuspension');
  
  await prisma.\$executeRaw`ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "suspendidoPorId" INTEGER`;
  console.log('2 OK - suspendidoPorId');
  
  await prisma.\$executeRaw`ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "fechaSuspension" TIMESTAMP(3)`;
  console.log('3 OK - fechaSuspension');
  
  await prisma.\$executeRaw`ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "moderacionRetirada" BOOLEAN NOT NULL DEFAULT false`;
  console.log('4 OK - moderacionRetirada Servicio');
  
  await prisma.\$executeRaw`ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "moderacionEstadoAnterior" TEXT`;
  console.log('5 OK - moderacionEstadoAnterior Servicio');
  
  await prisma.\$executeRaw`ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "moderacionMotivo" TEXT`;
  console.log('6 OK - moderacionMotivo Servicio');
  
  await prisma.\$executeRaw`ALTER TABLE "Proyecto" ADD COLUMN IF NOT EXISTS "moderacionRetirada" BOOLEAN NOT NULL DEFAULT false`;
  console.log('7 OK - moderacionRetirada Proyecto');
  
  await prisma.\$executeRaw`ALTER TABLE "Proyecto" ADD COLUMN IF NOT EXISTS "moderacionEstadoAnterior" TEXT`;
  console.log('8 OK - moderacionEstadoAnterior Proyecto');
  
  await prisma.\$executeRaw`ALTER TABLE "Proyecto" ADD COLUMN IF NOT EXISTS "moderacionMotivo" TEXT`;
  console.log('9 OK - moderacionMotivo Proyecto');
  
  console.log('Todas las columnas agregadas');
  await prisma.\$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.\$disconnect();
  process.exit(1);
});