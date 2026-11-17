// Seed del ecosistema de demostracion: 10 perfiles de freelancer
// con habilidades, biografias y calificaciones variadas.
// Cada freelancer publica varios servicios = ~44 ofertas en el catalogo,
// con minimo 5 servicios por cada una de las 8 categorias.
// NOTA: los precios son valores decorativos en USD (la pasarela cobra en COP).
// Idempotente: recrea los servicios de los freelancers demo sin duplicar perfiles.
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

// Fotos reales de Unsplash CDN (URLs verificadas) por categoria.
const IMAGENES_POR_CATEGORIA: Record<string, string[]> = {
  'Desarrollo Web': [
    'photo-1498050108023-c5249f4df085',
    'photo-1460925895917-afdab827c52f',
    'photo-1587620962725-abab7fe55159',
    'photo-1499750310107-5fef28a66643',
    'photo-1526374965328-7f61d4dc18c5',
    'photo-1516321318423-f06f85e504b3',
  ],
  'Aplicaciones Móviles': [
    'photo-1512941937669-90a1b58e7e9c',
    'photo-1511707171634-5f897ff02aa9',
    'photo-1551650975-87deedd944c3',
    'photo-1557804506-669a67965ba0',
    'photo-1526498460520-4c246339dccb',
  ],
  'Diseño Gráfico': [
    'photo-1522542550221-31fd19575a2d',
    'photo-1559028012-481c04fa702d',
    'photo-1561070791-2526d30994b5',
    'photo-1626785774573-4b799315345d',
    'photo-1558655146-d09347e92766',
  ],
  'Marketing Digital': [
    'photo-1432888498266-38ffec3eaf0a',
    'photo-1552664730-d307ca884978',
    'photo-1559136555-9303baea8ebd',
    'photo-1557804506-669a67965ba0',
    'photo-1542744173-8e7e53415bb0',
  ],
  'Redacción y Contenido': [
    'photo-1434030216411-0b793f4b4173',
    'photo-1455390582262-044cdead277a',
    'photo-1455390582262-044cdead277a',
    'photo-1499750310107-5fef28a66643',
    'photo-1516321318423-f06f85e504b3',
  ],
  'Video y Animación': [
    'photo-1574717024653-61fd2cf4d44d',
    'photo-1535016120720-40c646be5580',
    'photo-1492691527719-9d1e07e534b4',
    'photo-1497032628192-86f99bcd76bc',
    'photo-1557804506-669a67965ba0',
  ],
  'Datos y Análisis': [
    'photo-1551288049-bebda4e38f71',
    'photo-1460925895917-afdab827c52f',
    'photo-1543286386-713bdd548da4',
    'photo-1526374965328-7f61d4dc18c5',
  ],
  'Soporte Técnico': [
    'photo-1518770660439-4636190af475',
    'photo-1544197150-b99a580bb7a8',
    'photo-1558494949-ef010cbdcc31',
    'photo-1454165804606-c3d57bc86b40',
    'photo-1522202176988-66273c2fd55f',
  ],
};

// Clientes demo que "contrataron" a los freelancers (para contratos y reseñas).
const clientesDemo = [
  { nombre: 'María Fernanda López', email: 'cliente1@firstgig.demo' },
  { nombre: 'Carlos Andrés Peña', email: 'cliente2@firstgig.demo' },
  { nombre: 'Ana Lucía Vargas', email: 'cliente3@firstgig.demo' },
  { nombre: 'Jorge Iván Suárez', email: 'cliente4@firstgig.demo' },
];

// Pool de comentarios variados para las calificaciones.
const COMENTARIOS_RESEÑA = [
  'Excelente trabajo, entregó antes del plazo y la calidad superó mis expectativas.',
  'Muy profesional y comunicativo. El resultado quedó genial.',
  'Buen trabajo en general. Tardó un poco más de lo esperado pero valió la pena.',
  'Cumplió con todo lo acordado. Lo recomiendo ampliamente.',
  'Entregó exactamente lo que pedí, sin vueltas. Volvería a contratarlo.',
  'Calidad aceptable y precio justo. La comunicación pudo ser más fluida.',
  'Impecable atención al detalle. Súper recomendado para cualquier proyecto.',
  'Trabajo sólido y entregas puntuales. Cumplió el presupuesto acordado.',
];

// Puntuaciones variadas (la mayoria 5, algunas 4 y un par de 3 para realismo).
const PUNTUACIONES = [5, 4, 5, 5, 4, 5, 3, 5, 4, 5];

function urlImagen(categoria: string, indice: number): string {
  const pool = IMAGENES_POR_CATEGORIA[categoria] ?? IMAGENES_POR_CATEGORIA['Desarrollo Web'];
  const id = pool[indice % pool.length];
  return `https://images.unsplash.com/${id}?w=800&h=450&fit=crop&auto=format&q=80`;
}

type ServicioSeed = {
  titulo: string;
  descripcion: string;
  precio: number; // USD (decorativo)
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
      { titulo: 'Landing page profesional en React', descripcion: 'Diseño + desarrollo de landing page moderna, responsive y optimizada para conversión. Incluye formulario de contacto y SEO básico.', precio: 49, categoria: 'Desarrollo Web' },
      { titulo: 'Dashboard administrativo a medida', descripcion: 'Panel con gráficas, tablas y autenticación para visualizar métricas de tu negocio en tiempo real.', precio: 199, categoria: 'Desarrollo Web' },
      { titulo: 'Optimización de performance web', descripcion: 'Auditoría Core Web Vitals y optimización de carga, imágenes y bundle. Mejora tu puntuación de 60 a 90+.', precio: 99, categoria: 'Desarrollo Web' },
      { titulo: 'Corrección de errores frontend', descripcion: 'Diagnóstico y solución de bugs en tu interfaz: responsive, formularios, estado y renderizado.', precio: 29, categoria: 'Soporte Técnico' },
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
      { titulo: 'API REST con autenticación JWT', descripcion: 'Backend completo con registro, login, roles y documentación. Listo para conectar con tu frontend.', precio: 149, categoria: 'Desarrollo Web' },
      { titulo: 'Integración de pasarela de pagos', descripcion: 'Conexión con Mercado Pago / Stripe, webhooks y conciliación de pagos en tu sistema.', precio: 129, categoria: 'Desarrollo Web' },
      { titulo: 'Migración y modelado de base de datos', descripcion: 'Diseño de esquema relacional, migración de datos desde Excel/CSV y optimización de consultas.', precio: 99, categoria: 'Desarrollo Web' },
      { titulo: 'Script ETL de datos', descripcion: 'Pipeline que extrae datos de tus fuentes, los limpia y los carga en tu base de datos automáticamente.', precio: 119, categoria: 'Datos y Análisis' },
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
      { titulo: 'Identidad visual completa', descripcion: 'Logo, paleta de colores, tipografías y manual de marca. 3 propuestas iniciales.', precio: 59, categoria: 'Diseño Gráfico' },
      { titulo: 'Diseño UI de app móvil (5 pantallas)', descripcion: 'Wireframes + diseño visual de alta fidelidad para tu aplicación en Figma.', precio: 149, categoria: 'Diseño Gráfico' },
      { titulo: 'Pack de plantillas para redes sociales', descripcion: '30 plantillas editables para Instagram/Facebook: posts, historias y portadas.', precio: 39, categoria: 'Diseño Gráfico' },
      { titulo: 'Branding para emprendedores', descripcion: 'Nombre, isotipo, paleta y mini manual de marca para lanzar tu negocio.', precio: 69, categoria: 'Diseño Gráfico' },
      { titulo: 'Presentaciones corporativas', descripcion: 'Diseño de diapositivas para pitch, propuestas comerciales o clases. Plantilla editable.', precio: 45, categoria: 'Diseño Gráfico' },
      { titulo: 'Microcopy para interfaces', descripcion: 'Textos de botones, formularios y mensajes de error que mejoran la experiencia de usuario.', precio: 45, categoria: 'Redacción y Contenido' },
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
      { titulo: 'Auditoría SEO completa de tu sitio', descripcion: 'Análisis técnico, palabras clave, contenido y plan de acción priorizado en 30 días.', precio: 79, categoria: 'Marketing Digital' },
      { titulo: 'Campaña de Google Ads gestionada', descripcion: 'Configuración, segmentación y optimización de campañas durante un mes.', precio: 99, categoria: 'Marketing Digital' },
      { titulo: 'Estrategia de contenido mensual', descripcion: 'Calendario editorial, investigación de keywords y supervisión de redacción para tu blog.', precio: 149, categoria: 'Marketing Digital' },
      { titulo: 'Artículos de blog optimizados SEO', descripcion: 'Redacción de artículos de 1000+ palabras con palabras clave y estructura correcta.', precio: 35, categoria: 'Redacción y Contenido' },
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
      { titulo: 'Pack de 5 artículos SEO para blog', descripcion: 'Artículos de 1000+ palabras, investigados y optimizados con palabras clave que tú elijas.', precio: 39, categoria: 'Redacción y Contenido' },
      { titulo: 'Textos para tienda online', descripcion: 'Descripciones de producto, categorías y fichas que venden. Hasta 20 productos.', precio: 29, categoria: 'Redacción y Contenido' },
      { titulo: 'Newsletters mensuales', descripcion: '4 newsletters al mes para tu lista de correos: diseño de contenido + redacción.', precio: 49, categoria: 'Redacción y Contenido' },
      { titulo: 'Guiones para videos y podcasts', descripcion: 'Guiones con estructura, gancho y llamados a la acción para tu canal.', precio: 25, categoria: 'Redacción y Contenido' },
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
      { titulo: 'Edición de video corto (Reels/TikTok)', descripcion: 'Edición profesional con subtítulos, música y efectos. Entrega en 48 horas.', precio: 15, categoria: 'Video y Animación' },
      { titulo: 'Video promocional de producto', descripcion: 'Video de 30-60 segundos con guion, grabación guiada y edición completa.', precio: 129, categoria: 'Video y Animación' },
      { titulo: 'Motion graphics intro/outro', descripcion: 'Animación de marca para intros de video, logos animados y transiciones.', precio: 89, categoria: 'Video y Animación' },
      { titulo: 'Edición de episodio de podcast', descripcion: 'Limpieza de audio, eliminación de muletillas y masterización profesional.', precio: 49, categoria: 'Video y Animación' },
      { titulo: 'Subtítulos y traducción de videos', descripcion: 'Subtítulos sincronizados en español/inglés con corrección de estilo.', precio: 19, categoria: 'Video y Animación' },
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
      { titulo: 'Dashboard en Power BI', descripcion: 'Tablero interactivo conectado a tu fuente de datos con KPIs y gráficas dinámicas.', precio: 149, categoria: 'Datos y Análisis' },
      { titulo: 'Automatización de reportes con Python', descripcion: 'Script que genera reportes automáticos (Excel/PDF) desde tus bases de datos.', precio: 99, categoria: 'Datos y Análisis' },
      { titulo: 'Limpieza y organización de datos', descripcion: 'Excel/CSV desordenados → datos limpios, consistentes y listos para analizar.', precio: 39, categoria: 'Datos y Análisis' },
      { titulo: 'Dashboard en Tableau', descripcion: 'Visualizaciones interactivas con filtros dinámicos para presentaciones ejecutivas.', precio: 119, categoria: 'Datos y Análisis' },
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
      { titulo: 'App móvil MVP (Android + iOS)', descripcion: 'Aplicación funcional con diseño moderno, autenticación y backend incluido.', precio: 999, categoria: 'Aplicaciones Móviles' },
      { titulo: 'App de delivery / pedidos', descripcion: 'Catálogo, carrito, pagos y panel de pedidos. Basada en Flutter.', precio: 1299, categoria: 'Aplicaciones Móviles' },
      { titulo: 'App de reservas y citas', descripcion: 'Calendario de disponibilidad, recordatorios y pagos integrados.', precio: 799, categoria: 'Aplicaciones Móviles' },
      { titulo: 'App de finanzas personales', descripcion: 'Control de gastos, presupuestos y gráficas. Sincronización en la nube.', precio: 599, categoria: 'Aplicaciones Móviles' },
      { titulo: 'Publicación y mantenimiento de app', descripcion: 'Subo tu app a Play Store/App Store y la mantengo actualizada por un mes.', precio: 99, categoria: 'Aplicaciones Móviles' },
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
      { titulo: 'Gestión de Instagram (1 mes)', descripcion: '8 publicaciones, historias diarias, respuestas a comentarios y reporte mensual.', precio: 79, categoria: 'Marketing Digital' },
      { titulo: 'Campaña publicitaria en Meta Ads', descripcion: 'Diseño de públicos, creatividades y optimización de presupuesto publicitario.', precio: 89, categoria: 'Marketing Digital' },
      { titulo: 'Community management', descripcion: 'Moderación de comentarios, mensajes directos y plan de respuesta a tu comunidad.', precio: 59, categoria: 'Marketing Digital' },
      { titulo: 'Embudo de ventas para redes sociales', descripcion: 'Estrategia de contenido que convierte seguidores en clientes. Plan + plantillas.', precio: 119, categoria: 'Marketing Digital' },
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
      { titulo: 'Migración de sitio web sin downtime', descripcion: 'Traslado de hosting/dominio con plan de contingencia. Cero pérdida de datos.', precio: 99, categoria: 'Soporte Técnico' },
      { titulo: 'Configuración de servidor y despliegue', descripcion: 'Servidor Linux + Docker + Nginx + SSL. Tu app corriendo en producción.', precio: 149, categoria: 'Soporte Técnico' },
      { titulo: 'Auditoría de seguridad web', descripcion: 'Revisión de vulnerabilidades comunes, SSL, headers y buenas prácticas de seguridad.', precio: 79, categoria: 'Soporte Técnico' },
      { titulo: 'Soporte técnico mensual', descripcion: 'Atención prioritaria por chat/correo para problemas técnicos de tu empresa.', precio: 49, categoria: 'Soporte Técnico' },
      { titulo: 'Respaldo automático en la nube', descripcion: 'Configuración de backups programados para tu base de datos y archivos.', precio: 39, categoria: 'Soporte Técnico' },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 12);
  const contadorPorCategoria = new Map<string, number>();
  const ecosistema: { freelancerId: number; servicioId: number; precio: number }[] = [];

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

    // Recrear servicios del freelancer demo (evita precios/categorias viejas).
    // Orden: calificaciones -> contratos -> servicios (por las llaves foraneas).
    try {
      await prisma.calificacion.deleteMany({ where: { Contrato: { freelancerId: freelancer.id } } });
      await prisma.contrato.deleteMany({ where: { freelancerId: freelancer.id } });
      await prisma.servicio.deleteMany({ where: { freelancerId: freelancer.id } });
    } catch {
      console.warn(`  ${f.nombre}: no se pudieron borrar datos existentes (tienen pagos/entregas)`);
    }

    let creados = 0;
    for (const s of f.servicios) {
      const categoria = await prisma.categoria.findUnique({ where: { nombre: s.categoria } });
      const usados = contadorPorCategoria.get(s.categoria) ?? 0;
      contadorPorCategoria.set(s.categoria, usados + 1);
      const servicio = await prisma.servicio.create({
        data: {
          freelancerId: freelancer.id,
          categoriaId: categoria?.id ?? null,
          titulo: s.titulo,
          descripcion: s.descripcion,
          precio: s.precio,
          imagenUrl: urlImagen(s.categoria, usados),
          estado: 'activo',
        },
      });
      if (creados === 0) {
        ecosistema.push({ freelancerId: freelancer.id, servicioId: servicio.id, precio: s.precio });
      }
      creados++;
    }

    console.log(`${f.nombre}: ${creados} servicio(s)`);
  }

  // ---- Clientes demo ----
  const clientes: { id: number; nombre: string }[] = [];
  for (const c of clientesDemo) {
    const usuario = await prisma.usuario.upsert({
      where: { email: c.email },
      update: {},
      create: {
        nombre: c.nombre,
        email: c.email,
        passwordHash,
        rolId: 3,
        estado: 'activo',
      },
    });
    await prisma.cliente.upsert({
      where: { id: usuario.id },
      update: {},
      create: { id: usuario.id, tipoCliente: 'natural' },
    });
    clientes.push({ id: usuario.id, nombre: c.nombre });
  }
  console.log(`${clientes.length} clientes demo listos`);

  // ---- Contratos completados + calificaciones (reseñas) ----
  // Cada freelancer recibe 2 reseñas de clientes distintos sobre su primer servicio.
  let contratosCreados = 0;
  let resenasCreadas = 0;
  const resenasPorFreelancer = new Map<number, { suma: number; total: number }>();

  for (const [fi, item] of ecosistema.entries()) {
    // Dos reseñas por freelancer, de dos clientes rotativos
    for (let r = 0; r < 2; r++) {
      const cliente = clientes[(fi + r) % clientes.length];
      const puntuacion = PUNTUACIONES[(fi * 2 + r) % PUNTUACIONES.length];
      const comentario = COMENTARIOS_RESEÑA[(fi * 3 + r * 2) % COMENTARIOS_RESEÑA.length];

      // Contrato completado (idempotente por freelancer+servicio+cliente)
      let contrato = await prisma.contrato.findFirst({
        where: { freelancerId: item.freelancerId, servicioId: item.servicioId, clienteId: cliente.id, estado: 'completado' },
      });
      if (!contrato) {
        const fechaFin = new Date(Date.now() - (fi * 5 + r * 3 + 2) * 24 * 60 * 60 * 1000);
        contrato = await prisma.contrato.create({
          data: {
            freelancerId: item.freelancerId,
            clienteId: cliente.id,
            servicioId: item.servicioId,
            montoAcordado: item.precio,
            estado: 'completado',
            fechaInicio: new Date(fechaFin.getTime() - 7 * 24 * 60 * 60 * 1000),
            fechaFin,
          },
        });
        contratosCreados++;
      }

      // Reseña (idempotente por contrato+calificador)
      const yaExiste = await prisma.calificacion.findFirst({
        where: { contratoId: contrato.id, calificadorId: cliente.id },
      });
      if (yaExiste) continue;

      await prisma.calificacion.create({
        data: {
          contratoId: contrato.id,
          calificadorId: cliente.id,
          calificadoId: item.freelancerId,
          puntuacion,
          comentario,
        },
      });
      resenasCreadas++;

      const acc = resenasPorFreelancer.get(item.freelancerId) ?? { suma: 0, total: 0 };
      acc.suma += puntuacion;
      acc.total += 1;
      resenasPorFreelancer.set(item.freelancerId, acc);
    }
  }
  console.log(`${contratosCreados} contratos completados, ${resenasCreadas} reseñas nuevas`);

  // Actualizar calificacionPromedio de cada freelancer demo con el promedio real de sus reseñas
  for (const [freelancerId, acc] of resenasPorFreelancer) {
    const promedio = Math.round((acc.suma / acc.total) * 100) / 100;
    await prisma.freelancer.update({
      where: { id: freelancerId },
      data: { calificacionPromedio: promedio },
    });
  }

  // Reporte por categoria
  const porCategoria = await prisma.servicio.groupBy({
    by: ['categoriaId'],
    where: { estado: 'activo' },
    _count: { id: true },
  });
  const categorias = await prisma.categoria.findMany({ select: { id: true, nombre: true } });
  console.log('\nServicios activos por categoria:');
  for (const c of categorias) {
    const n = porCategoria.find((p) => p.categoriaId === c.id)?._count.id ?? 0;
    console.log(`  ${c.nombre}: ${n}`);
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
