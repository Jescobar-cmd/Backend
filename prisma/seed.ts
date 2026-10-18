// Seed para bases de datos nuevas (contenedores Docker):
// - roles base que referencia User.rolId (llave foránea a Rol)
// - usuario demo para probar el login sin configurar correo
// Es idempotente: se puede correr las veces que sea sin duplicar nada.
import bcrypt from 'bcryptjs';
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

  const demoEmail = 'demo@firstgig.com';
  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      nombre: 'Usuario Demo',
      email: demoEmail,
      passwordHash: await bcrypt.hash('Demo1234', 12),
      rolId: 3,
      estado: 'activo',
    },
  });

  console.log(`Seed OK: ${roles.length} roles + usuario demo (demo@firstgig.com / Demo1234)`);
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
