// Seed del ecosistema de demostracion: ~10 perfiles de freelancer
// con habilidades, biografias y calificaciones variadas, cada uno
// con 2 servicios publicados = 20 ofertas en el catalogo.
// Idempotente: se puede correr varias veces sin duplicar.
// Uso: npm run seed:ecosistema
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

const PASSWORD_DEMO = 'FirstGigDemo123!';

type ServicioSeed = {
  titulo: string;
  descripcion: string;
  precio: number;
  categoria: string;
};

type FreelancerSeed = {
  nombre: string;
  tituloProfesional: string;
  biografia: string;
  calificacion: number;
  habilidades: { nombre: string; nivel: string }[];
  servicios: ServicioSeed[];
};

const freelancers: FreelancerSeed[] = [
  {
    nombre: 'Valentina Ríos',
    tituloProfesional: 'Desarrolladora Frontend Senior',
    biografia: '5 años construyendo interfaces con React y TypeScript. Especialista en dashboards y e-commerce.',
    calificacion: 4.9,
    habilidades: [
      { nombre: 'React', nivel: 'experto' },
      { nombre: 'TypeScript', nivel: 'experto' },
      { nombre: 'Figma', nivel: 'intermedio' },
    ],
    servicios: [
      { titulo: 'Landing page profesional en React', descripcion: 'Diseño + desarrollo de landing page moderna, responsive y optimizada para conversión. Incluye formulario de contacto y SEO básico.', precio: 450000, categoria: 'Desarrollo Web' },
      { titulo: 'Dashboard administrativo a medida', descripcion: 'Panel con gráficas, tablas y autenticación para visualizar métricas de tu negocio en tiempo real.', precio: 1200000, categoria: 'Desarrollo Web' },
    ],
  },
  {
    nombre: 'Andrés Cárdenas',
    tituloProfesional: 'Desarrollador Backend & APIs',
    biografia: 'Node.js, PostgreSQL y arquitectura limpia. Diseño APIs REST seguras y escalables.',
    calificacion: 4.7,
    habilidades: [
      { nombre: 'Node.js', nivel: 'experto' },
      { nombre: 'PostgreSQL', nivel: 'experto' },
      { nombre: 'TypeScript', nivel: 'avanzado' },
    ],
    servicios: [
      { titulo: 'API REST con autenticación JWT', descripcion: 'Backend completo con registro, login, roles y documentación. Listo para conectar con tu frontend.', precio: 800000, categoria: 'Desarrollo Web' },
      { titulo: 'Integración de pasarela de pagos', descripcion: 'Conexión con Mercado Pago / Stripe, webhooks y conciliación de pagos en tu sistema.', precio: 650000, categoria: 'Desarrollo Web' },
    ],
  },
  {
    nombre: 'Camila Restrepo',
    tituloProfesional: 'Diseñadora UI/UX',
    biografia: 'Diseño centrado en el usuario. Figma, sistemas de diseño y prototipos interactivos.',
    calificacion: 4.8,
    habilidades: [
      { nombre: 'Figma', nivel: 'experto' },
      { nombre: 'Adobe Photoshop', nivel: 'avanzado' },
    ],
    servicios: [
      { titulo: 'Diseño de identidad visual completa', descripcion: 'Logo, paleta de colores, tipografías y manual de marca. 3 propuestas iniciales.', precio: 550000, categoria: 'Diseño Gráfico' },
      { titulo: 'Diseño UI de app móvil (5 pantallas)', descripcion: 'Wireframes + diseño visual de alta fidelidad para tu aplicación en Figma.', precio: 900000, categoria: 'Diseño Gráfico' },
    ],
  },
  {
    nombre: 'Julián Mora',
    tituloProfesional: 'Especialista en SEO y Marketing',
    biografia: '5 años posicionando marcas locales e internacionales. Datos y contenido como estrategia.',
    calificacion: 4.5,
    habilidades: [
      { nombre: 'SEO', nivel: 'experto' },
      { nombre: 'Google Ads', nivel: 'avanzado' },
      { nombre: 'Copywriting', nivel: 'avanzado' },
    ],
    servicios: [
      { titulo: 'Auditoría SEO completa de tu sitio', descripcion: 'Análisis técnico, palabras clave, contenido y plan de acción priorizado en 30 días.', precio: 380000, categoria: 'Marketing Digital' },
      { titulo: 'Campaña de Google Ads gestionada', descripcion: 'Configuración, segmentación y optimización de campañas durante un mes.', precio: 500000, categoria: 'Marketing Digital' },
    ],
  },
  {
    nombre: 'Daniela Ospina',
    tituloProfesional: 'Redactora de Contenido',
    biografia: 'Periodista con experiencia en blogs, e-commerce y contenido para redes sociales.',
    calificacion: 4.6,
    habilidades: [
      { nombre: 'Copywriting', nivel: 'experto' },
      { nombre: 'Redacción de artículos', nivel: 'experto' },
    ],
    servicios: [
      { titulo: 'Pack de 5 artículos SEO para blog', descripcion: 'Artículos de 1000+ palabras, investigados y optimizados con palabras clave que tú elijas.', precio: 420000, categoria: 'Redacción y Contenido' },
      { titulo: 'Textos para tienda online', descripcion: 'Descripciones de producto, categorías y fichas que venden. Hasta 20 productos.', precio: 300000, categoria: 'Redacción y Contenido' },
    ],
  },
  {
    nombre: 'Santiago Vélez',
    tituloProfesional: 'Editor de Video y Motion Graphics',
    biografia: 'Edición para YouTube, TikTok y marcas. After Effects, DaVinci y motion design.',
    calificacion: 4.8,
    habilidades: [
      { nombre: 'Edición de video', nivel: 'experto' },
      { nombre: 'After Effects', nivel: 'avanzado' },
      { nombre: 'Motion Graphics', nivel: 'avanzado' },
    ],
    servicios: [
      { titulo: 'Edición de video corto (Reels/TikTok)', descripcion: 'Edición profesional con subtítulos, música y efectos. Entrega en 48 horas.', precio: 150000, categoria: 'Video y Animación' },
      { titulo: 'Video promocional de producto', descripcion: 'Video de 30-60 segundos con guion, grabación guiada y edición completa.', precio: 700000, categoria: 'Video y Animación' },
    ],
  },
  {
    nombre: 'Laura Gómez',
    tituloProfesional: 'Analista de Datos',
    biografia: 'Python, SQL y Power BI. Convierto datos crudos en decisiones claras para empresas.',
    calificacion: 4.7,
    habilidades: [
      { nombre: 'Python', nivel: 'experto' },
      { nombre: 'SQL', nivel: 'experto' },
      { nombre: 'Power BI', nivel: 'avanzado' },
    ],
    servicios: [
      { titulo: 'Dashboard en Power BI', descripcion: 'Tablero interactivo conectado a tu fuente de datos con KPIs y gráficas dinámicas.', precio: 850000, categoria: 'Datos y Análisis' },
      { titulo: 'Automatización de reportes con Python', descripcion: 'Script que genera reportes automáticos (Excel/PDF) desde tus bases de datos.', precio: 600000, categoria: 'Datos y Análisis' },
    ],
  },
  {
    nombre: 'Mateo Ramírez',
    tituloProfesional: 'Desarrollador de Apps Móviles',
    biografia: 'Flutter y React Native. Apps publicadas en Play Store y App Store.',
    calificacion: 4.9,
    habilidades: [
      { nombre: 'Flutter', nivel: 'experto' },
      { nombre: 'React Native', nivel: 'avanzado' },
      { nombre: 'Node.js', nivel: 'intermedio' },
    ],
    servicios: [
      { titulo: 'App móvil MVP (Android + iOS)', descripcion: 'Aplicación funcional con diseño moderno, autenticación y backend incluido.', precio: 3500000, categoria: 'Aplicaciones Móviles' },
      { titulo: 'App de delivery / pedidos', descripcion: 'Catálogo, carrito, pagos y panel de pedidos. Basada en Flutter.', precio: 4200000, categoria: 'Aplicaciones Móviles' },
    ],
  },
  {
    nombre: 'Isabella Castro',
    tituloProfesional: 'Especialista en Meta & Redes Sociales',
    biografia: 'Gestiono comunidades y campañas en Instagram, Facebook y TikTok para pymes.',
    calificacion: 4.4,
    habilidades: [
      { nombre: 'Meta Ads', nivel: 'experto' },
      { nombre: 'Copywriting', nivel: 'avanzado' },
      { nombre: 'SEO', nivel: 'intermedio' },
    ],
    servicios: [
      { titulo: 'Gestión de Instagram (1 mes)', descripcion: '8 publicaciones, historias diarias, respuestas a comentarios y reporte mensual.', precio: 700000, categoria: 'Marketing Digital' },
      { titulo: 'Campaña publicitaria en Meta Ads', descripcion: 'Diseño de públicos, creatividades y optimización de presupuesto publicitario.', precio: 450000, categoria: 'Marketing Digital' },
    ],
  },
  {
    nombre: 'Tomás Herrera',
    tituloProfesional: 'Soporte Técnico & DevOps',
    biografia: 'Resuelvo problemas de infraestructura, redes y servidores. Linux, Docker y AWS.',
    calificacion: 4.6,
    habilidades: [
      { nombre: 'Soporte técnico', nivel: 'experto' },
      { nombre: 'Redes y servidores', nivel: 'experto' },
      { nombre: 'PostgreSQL', nivel: 'avanzado' },
    ],
    servicios: [
      { titulo: 'Migración de sitio web sin downtime', descripcion: 'Traslado de hosting/dominio con plan de contingencia. Cero pérdida de datos.', precio: 500000, categoria: 'Soporte Técnico' },
      { titulo: 'Configuración de servidor y despliegue', descripcion: 'Servidor Linux + Docker + Nginx + SSL. Tu app corriendo en producción.', precio: 750000, categoria: 'Soporte Técnico' },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 12);

  for (const [index, f] of freelancers.entries()) {
    const email = `freelancer${index + 1}@firstgig.demo`;

    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: {
        nombre: f.nombre,
        email,
        passwordHash,
        rolId: 2,
        estado: 'activo',
        telefono: `+57300${String(1000000 + index * 137).slice(0, 7)}`,
      },
    });

    const freelancer = await prisma.freelancer.upsert({
      where: { id: usuario.id },
      update: {
        tituloProfesional: f.tituloProfesional,
        biografia: f.biografia,
        calificacionPromedio: f.calificacion,
      },
      create: {
        id: usuario.id,
        tituloProfesional: f.tituloProfesional,
        biografia: f.biografia,
        calificacionPromedio: f.calificacion,
      },
    });

    // Habilidades del perfil
    for (const hab of f.habilidades) {
      const habilidad = await prisma.habilidad.findUnique({ where: { nombre: hab.nombre } });
      if (!habilidad) continue;
      await prisma.freelancerHabilidad.upsert({
        where: { freelancerId_habilidadId: { freelancerId: freelancer.id, habilidadId: habilidad.id } },
        update: { nivel: hab.nivel },
        create: { freelancerId: freelancer.id, habilidadId: habilidad.id, nivel: hab.nivel },
      });
    }

    // Servicios (ofertas) del freelancer
    let creados = 0;
    for (const s of f.servicios) {
      const categoria = await prisma.categoria.findUnique({ where: { nombre: s.categoria } });
      const existe = await prisma.servicio.findFirst({
        where: { freelancerId: freelancer.id, titulo: s.titulo },
      });
      if (existe) continue;
      await prisma.servicio.create({
        data: {
          freelancerId: freelancer.id,
          categoriaId: categoria?.id ?? null,
          titulo: s.titulo,
          descripcion: s.descripcion,
          precio: s.precio,
          estado: 'activo',
        },
      });
      creados++;
    }

    console.log(`${f.nombre}: ${creados} servicio(s) nuevo(s)`);
  }

  const totalServicios = await prisma.servicio.count({ where: { estado: 'activo' } });
  const totalFreelancers = await prisma.freelancer.count();
  console.log(`\nSeed ecosistema OK: ${totalFreelancers} freelancers, ${totalServicios} servicios activos en total`);
}

main()
  .catch((e) => {
    console.error('Error en el seed del ecosistema:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
