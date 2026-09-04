import {
  ProjectModel,
  JobModel,
  SiteInfoModel,
  NavLinkModel,
  SocialLinkModel,
} from '../models/index.js';

/**
 * Seed data mirroring the portfolio's current hardcoded content
 * (src/components/sections/ProjectsSection.astro + src/constants/* +
 * messages/{es,en}.json). `imageUrl` for the 18 legacy images is stored as
 * the local asset slug — the portfolio's image resolver maps it back to the
 * bundled ImageMetadata (resolved open question 2). Roles/order match the
 * site's display order.
 */

export interface ProjectSeed {
  name: string; url: string; desc_es: string; desc_en: string;
  imageUrl: string; order: number; visible: boolean;
}

export const contentSeedData = {
  projects: [
    {
      name: 'Real Estate Dashboard', url: 'https://luxlifemiamiblog.com/market-statistics/',
      desc_es: 'Dashboard React con 50K+ registros inmobiliarios en Miami. Filtros por precio, ROI, tipo de propiedad. Google Maps API.',
      desc_en: 'React dashboard with 50K+ Miami real estate records. Filters by price, ROI, property type. Google Maps API.',
      imageUrl: 'luxlife', order: 0, visible: true,
    },
    {
      name: 'Gericht', url: 'https://restaurant.coltmandev.dev/',
      desc_es: 'Landing page de restaurante con menú, galería y reservas. Diseño responsivo.',
      desc_en: 'Restaurant landing page with menu, gallery, and reservations. Responsive design.',
      imageUrl: 'gericht', order: 1, visible: true,
    },
    {
      name: 'Cesde', url: 'https://www.cesde.edu.co/',
      desc_es: 'Institución de educación técnica y tecnológica en Colombia. Programas laborales en tecnología, gastronomía, salud y más.',
      desc_en: 'Technical and technological education institution in Colombia. Job-ready programs in tech, gastronomy, health, and more.',
      imageUrl: 'cesde', order: 2, visible: true,
    },
    {
      name: 'Thinkus', url: 'https://thinkus.io/',
      desc_es: 'IT Staff Augmentation. Aliado tecnológico para empresas que necesitan talento especializado en desarrollo de software.',
      desc_en: 'IT Staff Augmentation. Technology partner for companies needing specialized software development talent.',
      imageUrl: 'thinkous', order: 3, visible: true,
    },
    {
      name: 'Dogtorscat', url: 'https://www.dogtorscat.com/',
      desc_es: 'Hospital veterinario felino con certificación Cat Friendly Practice Gold. Urgencias 24h, cirugía y especialidades.',
      desc_en: 'Feline veterinary hospital with Cat Friendly Practice Gold certification. 24h emergency, surgery, and specialties.',
      imageUrl: 'dogtor', order: 4, visible: true,
    },
    {
      name: 'Hisomos', url: 'https://hisomos.com/',
      desc_es: 'E-commerce de brazaletes y charms con propósito social. Cada compra apoya causas benéficas.',
      desc_en: 'E-commerce for bracelets and charms with a social purpose. Every purchase supports charitable causes.',
      imageUrl: 'hisomo', order: 5, visible: true,
    },
    {
      name: 'Book project', url: 'https://projects.coltmandev.dev/product-book/',
      desc_es: 'App web interactiva para explorar y descubrir libros. Construida con tecnologías modernas de frontend.',
      desc_en: 'Interactive web app for exploring and discovering books. Built with modern frontend technologies.',
      imageUrl: 'book-test', order: 6, visible: true,
    },
    {
      name: 'Boreal Expedition', url: 'https://borealexpedition.com/',
      desc_es: 'Plataforma de tours en Islandia. Paquetes de auroras boreales y excursiones con guías expertos.',
      desc_en: 'Iceland tour platform. Northern Lights packages and excursions with expert guides.',
      imageUrl: 'boreal', order: 7, visible: true,
    },
    {
      name: 'Incredible Table', url: 'https://incredible-table.vercel.app/',
      desc_es: 'Dashboard de gestión hotelera. Administración de habitaciones, tarifas, amenities y estado de ocupación.',
      desc_en: 'Hotel management dashboard. Room, rate, amenity, and occupancy status administration.',
      imageUrl: 'incredible-room', order: 8, visible: true,
    },
    {
      name: 'Pokemon API', url: 'https://next-pokemon-coral.vercel.app/',
      desc_es: 'Pokedex interactiva con datos de la PokéAPI. Buscador, favoritos y explorador visual de Pokémon.',
      desc_en: 'Interactive Pokédex with data from PokéAPI. Search, favorites, and visual Pokémon explorer.',
      imageUrl: 'pockemon', order: 9, visible: true,
    },
    {
      name: 'News App', url: 'https://news-app-sage-theta.vercel.app/',
      desc_es: 'Agregador de noticias con artículos de múltiples fuentes. Navegación por categorías y lectura integrada.',
      desc_en: 'News aggregator with articles from multiple sources. Category navigation and integrated reading.',
      imageUrl: 'news-app', order: 10, visible: true,
    },
    {
      name: 'Bajalenx', url: 'https://projects.coltmandev.dev/bajalenx/',
      desc_es: 'Aplicación web para descargar contenido de diversas plataformas. Experiencia de usuario simple y rápida.',
      desc_en: 'Web application for downloading content from various platforms. Simple and fast user experience.',
      imageUrl: 'bajalenx', order: 11, visible: true,
    },
    {
      name: 'Clima App', url: 'https://clima-gray-nine.vercel.app/',
      desc_es: 'App del clima con pronóstico por ciudad, temperatura y viento por hora, y mapas meteorológicos.',
      desc_en: 'Weather app with city forecasts, hourly temperature and wind, and weather maps.',
      imageUrl: 'clima-app', order: 12, visible: true,
    },
    {
      name: 'Steps Together', url: 'https://stepstogether.co.uk/',
      desc_es: 'Clínica privada de rehabilitación de adicciones en Reino Unido. Desintoxicación médica y tratamiento residencial.',
      desc_en: 'Private addiction rehabilitation clinic in the UK. Medical detox and residential treatment.',
      imageUrl: 'stepstogether', order: 13, visible: true,
    },
    {
      name: 'White River Recovery', url: 'https://www.whiteriverrecovery.nl/',
      desc_es: 'Clínica de rehabilitación de clase mundial en Sudáfrica. Tratamiento para drogas, alcohol y abuso de sustancias.',
      desc_en: 'World-class rehabilitation clinic in South Africa. Treatment for drugs, alcohol, and substance abuse.',
      imageUrl: 'whiteriver', order: 14, visible: true,
    },
    {
      name: 'Orchid Recovery', url: 'https://orchidrecoverythailand.com/',
      desc_es: 'Rehab de lujo asequible en Chiang Mai, Tailandia. Tratamiento de adicciones y salud mental.',
      desc_en: 'Affordable luxury rehab in Chiang Mai, Thailand. Addiction and mental health treatment.',
      imageUrl: 'orchidrecovery', order: 15, visible: true,
    },
    {
      name: 'Instituto MIA', url: 'https://institutomia.es/',
      desc_es: 'Centro de rehabilitación para mujeres en España. Tratamiento de adicciones, drogas y salud mental.',
      desc_en: 'Rehabilitation center for women in Spain. Addiction, drug, and mental health treatment.',
      imageUrl: 'institutomia', order: 16, visible: true,
    },
    {
      name: 'The Hills Rehab', url: 'https://thehillsrehabchiangmai.com/',
      desc_es: 'Clínica de rehabilitación de lujo en Chiang Mai, Tailandia. Acreditación AACI, tratamiento hospitalario y salud mental.',
      desc_en: 'Luxury rehabilitation clinic in Chiang Mai, Thailand. AACI accreditation, inpatient treatment, and mental health.',
      imageUrl: 'thehillsrehab', order: 17, visible: true,
    },
  ] satisfies ProjectSeed[],

  jobs: [
    {
      title_es: 'Desarrollador Full Stack — Integración de IA',
      title_en: 'Full Stack Developer — AI Integration',
      company_es: 'New Movement Agency', company_en: 'New Movement Agency',
      start: '2025-11', end: '2026-6',
      description_es: 'Diseñé e implementé soluciones potenciadas con IA integrando APIs de LLM (OpenAI, modelos locales) en plataformas web existentes, reduciendo el procesamiento manual de datos en un 60%. Arquitecté aplicaciones web de alto rendimiento con optimización de servidor, estrategias de caché y ajuste de bases de datos logrando tiempos de carga menores a 2s. Administré infraestructura Linux en la nube (LAMP) asegurando 99.9% de uptime. Implementé arquitectura SEO optimizada mejorando rankings orgánicos en un 40%. Lideré sesiones de discovery con clientes, traduciendo requerimientos de negocio en especificaciones técnicas.',
      description_en: 'Designed and deployed AI-powered solutions integrating LLM APIs (OpenAI, local models) into existing web platforms, reducing manual data processing by 60%. Architected high-performance web applications with server-side optimization, caching strategies, and database tuning achieving sub-2s load times. Managed Linux cloud infrastructure (LAMP stack) ensuring 99.9% uptime. Implemented SEO-optimized architecture improving organic search rankings by 40%. Led technical discovery sessions with clients, translating business requirements into technical specifications.',
      order: 0, visible: true,
    },
    {
      title_es: 'Desarrollador Web Senior', title_en: 'Senior Web Developer',
      company_es: 'Addiction Marketing Agency', company_en: 'Addiction Marketing Agency',
      start: '2024-5', end: '2025-11',
      description_es: 'Implementé un servidor LAMP en la nube para alojar múltiples proyectos WordPress. Desarrollé un directorio de alto rendimiento con tipos de contenido personalizados, taxonomías avanzadas y metacontenido optimizado para SEO, utilizando PHP nativo y JavaScript. Creé diversos sitios con contenido extenso, priorizando velocidad y posicionamiento orgánico. Diseñé arquitecturas de datos de alto rendimiento con taxonomías avanzadas y meta-información que anticipan cómo las knowledge bases estructuradas alimentan los sistemas RAG actuales.',
      description_en: 'Implemented a LAMP server in the cloud to host multiple WordPress projects. Developed a high-performance directory with custom post types, advanced taxonomies, and SEO-optimized meta content, using native PHP and JavaScript. Built various sites with extensive content, prioritizing speed and organic ranking. Designed high-performance data architectures with advanced taxonomies and meta-information that anticipate how structured knowledge bases feed today\'s RAG systems.',
      order: 1, visible: true,
    },
    {
      title_es: 'Desarrollador Fullstack WordPress', title_en: 'WordPress Fullstack Developer',
      company_es: 'TREMGROUP LLC', company_en: 'TREMGROUP LLC',
      start: '2022-8', end: '2024-4',
      description_es: 'Desarrollé componentes interactivos en React.js para visualización de datos estadísticos de valores inmobiliarios en Miami. Mantuve y optimicé sitios web legacy (8+ años), modernizando su código y añadiendo funcionalidades. Creé soluciones personalizadas con WordPress, Next.js y React, destacando la integración de Google Maps API para sistemas de filtrado de propiedades por precio y rentabilidad. Esos dashboards integraron múltiples fuentes de datos (APIs, MLS, CSV) estableciendo patrones de ETL y normalización que luego apliqué a pipelines de automatización con IA.',
      description_en: 'Developed interactive React.js components for visualizing real estate statistics in Miami. Maintained and optimized legacy websites (8+ years old), modernizing their code and adding features. Created custom solutions with WordPress, Next.js, and React, including Google Maps API integrations for filtering properties by price and profitability. Those dashboards integrated multiple data sources (APIs, MLS, CSV) establishing ETL and normalization patterns that I later applied to AI-driven automation pipelines.',
      order: 2, visible: true,
    },
    {
      title_es: 'Desarrollador Web', title_en: 'Web Developer',
      company_es: 'Nación Digital', company_en: 'Nación Digital',
      start: '2018-10', end: '2022-6',
      description_es: 'Desarrollé y mantuve sitios WordPress, incluyendo interfaces para clientes y paneles de administración. Creé plugins y themes personalizados para sitios publicitarios y de comercio electrónico. Construí APIs con Node.js. Desarrollé REST APIs con Node.js que establecieron los patrones de integración que hoy aplico para conectar modelos de lenguaje con plataformas web.',
      description_en: 'Developed and maintained WordPress sites, including client-facing interfaces and dashboards. Created custom plugins and themes for advertising or e-commerce sites for clients. Built APIs with Node.js. Developed REST APIs with Node.js that established the integration patterns I now apply to connect language models with web platforms.',
      order: 3, visible: true,
    },
    {
      title_es: 'Especialista en soporte técnico', title_en: 'Technical Support Specialist',
      company_es: 'SCM-255, CA', company_en: 'SCM-255, CA',
      start: '2015-9', end: '2018-10',
      description_es: 'Atendí incidencias de equipos de cómputo, creé cuentas de correo y propuse mejoras técnicas. Brindé asistencia y soporte al personal con sus necesidades de ofimática. Reparé y mantuve computadoras, equipos de red, cableado e impresoras.',
      description_en: 'Handled computer equipment incidents, created email accounts, and proposed technical improvements. Provided help and support to staff with their office automation needs. Repaired and maintained computers, network equipment and cabling, and printers.',
      order: 4, visible: true,
    },
    {
      title_es: 'Especialista en soporte técnico', title_en: 'Technical Support Specialist',
      company_es: 'Autónomo', company_en: 'Self Employed',
      start: '2010-8', end: '2015-8',
      description_es: 'Reparación de computadoras y equipos. Diagnóstico de equipos. Mantenimiento de sistemas operativos. Instalación de sistemas operativos.',
      description_en: 'Computer and equipment repair. Equipment diagnostics. Operating system maintenance. Operating system installation.',
      order: 5, visible: true,
    },
  ],

  siteInfo: {
    name: 'Juan Carlos Ávila',
    jobTitle: 'Web Developer + AI Automation',
    url: 'https://coltmandev.dev',
    telephone: '+58 424 831 0009',
    logo: '/favicon.svg',
    brandName: 'Juan Carlos Ávila',
    twitterHandle: '@juanvs23',
    sameAs: [
      'https://github.com/juanvs23',
      'https://www.linkedin.com/in/juanvs23/',
      'https://x.com/juanvs23',
      'https://www.facebook.com/juancarlos.avila.1420/',
    ],
  },

  nav: [
    { key: 'menu.home', path: '/', order: 0, visible: true },
    { key: 'menu.about', path: '/about', order: 1, visible: true },
    { key: 'menu.services', path: '/services', order: 2, visible: true },
    { key: 'menu.contact', path: '/contact', order: 3, visible: true },
  ],

  social: [
    { name: 'GitHub', href: 'https://github.com/juanvs23', icon: 'github', order: 0, visible: true },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/juanvs23/', icon: 'linkedin', order: 1, visible: true },
    { name: 'X', href: 'https://x.com/juanvs23', icon: 'twitter', order: 2, visible: true },
    { name: 'Facebook', href: 'https://www.facebook.com/juancarlos.avila.1420/', icon: 'facebook', order: 3, visible: true },
  ],
};

export interface SeedCounts {
  projects: number; jobs: number; siteInfo: number; nav: number; social: number;
}

/**
 * Seeds the initial content. Idempotent: each row is upserted on a natural
 * key (name+url for projects, title+company for jobs, key for nav,
 * name+href for social, singleton for site-info) so re-running never
 * duplicates. Returns how many documents exist after seeding.
 */
export async function seedContent(): Promise<SeedCounts> {
  const { projects, jobs, siteInfo, nav, social } = contentSeedData;

  await ProjectModel.bulkWrite(projects.map((p) => ({
    updateOne: {
      filter: { name: p.name, url: p.url },
      update: { $set: p },
      upsert: true,
    },
  })));
  await JobModel.bulkWrite(jobs.map((j) => ({
    updateOne: {
      filter: { title_es: j.title_es, company_es: j.company_es },
      update: { $set: j },
      upsert: true,
    },
  })));
  await NavLinkModel.bulkWrite(nav.map((n) => ({
    updateOne: { filter: { key: n.key }, update: { $set: n }, upsert: true },
  })));
  await SocialLinkModel.bulkWrite(social.map((s) => ({
    updateOne: { filter: { name: s.name, href: s.href }, update: { $set: s }, upsert: true },
  })));
  await SiteInfoModel.findOneAndUpdate(
    {},
    { $set: siteInfo },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return {
    projects: await ProjectModel.countDocuments(),
    jobs: await JobModel.countDocuments(),
    siteInfo: await SiteInfoModel.countDocuments(),
    nav: await NavLinkModel.countDocuments(),
    social: await SocialLinkModel.countDocuments(),
  };
}