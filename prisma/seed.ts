// Seed mínimo para bases de datos nuevas (contenedores Docker):
// los roles que referencia User.rolId (llave foránea a Rol).
// Es idempotente: se puede correr las veces que sea sin duplicar nada.
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

const roles = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Freelancer' },
  { id: 3, nombre: 'Cliente' },
];

async function main() {
  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { id: rol.id },
      update: { nombre: rol.nombre },
      create: rol,
    });
  }
  console.log(`Seed OK: ${roles.length} roles disponibles`);
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
