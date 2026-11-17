import { prisma } from './src/config/conexionBd';
async function main() {
  const f = await prisma.factura.findFirst({ where: { pagoId: 10 }, orderBy: { id: 'desc' } });
  console.log(JSON.stringify(f, null, 1));
}
main().finally(() => process.exit(0));
