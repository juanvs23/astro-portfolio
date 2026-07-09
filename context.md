# Contexto del Proyecto: Portafolio Multilingüe con Astro

## 1. Descripción General

Portafolio profesional de Juan Carlos Ávila, construido con **Astro 5** (migrado desde Next.js). Multilingüe (español e inglés) con arquitectura de componentes, Three.js interactivo, formulario de contacto vía Resend, y desplegado en **Vercel**.

**Stack actual:**
- Astro 5 + TypeScript (strict)
- Tailwind CSS v3
- Three.js (carga diferida, bundle separado)
- Resend (API de emails transaccionales)
- Despliegue: **Vercel** (anteriormente Next.js en Vercel, migrado a Astro)

**Posicionamiento:** Web Developer + AI Automation Specialist. El portafolio promociona a Juan Carlos como desarrollador web con especialización en automatización con IA (chatbots RAG, agentes autónomos, integración LLM), apuntando a PyMEs que necesitan combinar desarrollo web tradicional con automatización inteligente.

## 2. Estilizado con Tailwind CSS

Adaptado de acuerdo al archivo `DESIGN.md` en la raíz.

### Paleta de Colores
| Token | Valor | Uso |
|---|---|---|
| canvas | `#fdfcfc` | Fondo principal |
| ink | `#201d1d` | Texto principal, headlines |
| ink-deep | `#0f0000` | Estado pressed de CTA |
| charcoal | `#302c2c` | Texto secundario |
| body | `#424245` | Texto de párrafo |
| mute | `#646262` | Metadata, footer links |
| stone | `#6e6e73` | Utility text |
| ash | `#9a9898` | Disabled text |
| surface-soft | `#f8f7f7` | Text-input, testimonial rows |
| surface-card | `#f1eeee` | Install snippet, disabled buttons |
| surface-dark | `#201d1d` | Hero TUI mockup |
| surface-dark-elevated | `#302c2c` | Prompt row dentro del TUI |
| hairline | `rgba(15,0,0,0.12)` | Divisores de sección |
| hairline-strong | `#646262` | Tab strip rule |
| accent | `#007aff` | Links informativos (solo TUI) |
| danger | `#ff3b30` | Estado destructivo |
| warning | `#ff9f0a` | Callouts de precaución |
| success | `#30d158` | Indicador de éxito |

### Tipografía
- **Fuente principal:** Berkeley Mono (fallback: JetBrains Mono, IBM Plex Mono, Geist Mono)
- 100% monoespaciada
- Pesos: 400 (regular), 500 (medium), 700 (bold)

### Spacing
| Token | Valor |
|---|---|
| xxs | 1px |
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| xxl | 32px |
| section | 96px |

### Principios de Diseño
- 100% tipografía monoespaciada
- Fondo crema `#fdfcfc` como único background de body
- Sin sombras, sin gradientes, sin imágenes decorativas
- Marcadores ASCII `[+]`, `[-]`, `[x]` como bullets/iconos
- Secciones separadas por reglas hairline de 1px
- Ritmo de sección: 96px entre bloques de contenido
- Solo una superficie dark (`#201d1d`) por página (hero)

## 3. Arquitectura

### Estructura de Carpetas
```
src/
├── assets/img/        # Imágenes (optimizadas con <Image /> de Astro)
├── components/
│   ├── ui/            # Button, Input, Textarea, Badge, Section, AsciiMarker
│   ├── layout/        # Header, Footer, LanguageSwitcher, MobileMenu, ThemeToggle, SectionButtons
│   └── sections/      # HeroSection, AboutSection, SkillsSection, ExperienceSection, ProjectsSection, ContactSection
├── constants/         # Datos estáticos (jobs, proyectos, redes)
├── i18n/              # Utilidades de internacionalización
├── layouts/           # BaseLayout.astro
├── lib/               # Lógica: three-scene.ts (escena 3D)
├── pages/
│   ├── index.astro    # Homepage (redirige a /es/)
│   ├── [locale]/      # Rutas multilingües (about, contact, experience, projects, skills, index)
│   └── api/contact.ts # Endpoint POST con Resend
├── types/             # Interfaces TypeScript
└── styles/            # global.css

public/
├── favicon.ico, favicon.svg
└── robots.txt
```

### Mensajes de Internacionalización
- `messages/en.json` - Inglés
- `messages/es.json` - Español
- 26 secciones, completamente traducidas y pareadas

### Tipos TypeScript (`src/types/index.ts`)
- `ItemView`, `JobItem`, `JobToolItem` - Elementos de vista y experiencia
- `InputInterface`, `Status` - Formulario y estados
- `NetworkItem`, `SocialNetworksInterface` - Redes sociales
- `EmailMe`, `ContactUsInterface` - Contacto
- `FormInterface` - Estado del formulario
- `ProjectItem`, `ProjectSectionType` - Proyectos

### Constantes (`src/constants/`)
- `getJobs()` - 8 experiencias laborales
- Proyectos, redes sociales, formulario de contacto

## 4. Three.js (Hero Section)

La frontpage tiene una escena 3D interactiva:
- **Burbuja deformable** con cursor tracking (restringido a 25% del viewport)
- Partículas flotantes
- Mouse/touch interaction con deformación de malla
- **Carga diferida**: dynamic import(), bundle separado (HeroSection: 5.71KB vs 509KB original)
- Colores HSL animados en el tiempo
- **Estados**: ✅ WebGL fallback probado, View Transitions cleanup + re-init funcional
- **Nota**: En sandbox del navegador aparece "WebGL Disabled" — es esperado, funciona en entorno real

## 5. Secciones del Portafolio

### a. Quién Soy
- Imagen: `src/assets/img/aboutme.jpg` (optimizada con Astro `<Image />`)
- Descripción bilingüe enfocada en Web Dev + AI Automation (8+ años exp, chatbots IA, RAG, agentes autónomos)
- Skills list con ASCII markers `[+]`: WordPress/React, Python/PHP, Chatbots IA+RAG, Agentes autónomos, APIs, Linux/Docker

### b. Skills
- 7 categorías: Frontend, Backend, CMS, DevOps & Tools, APIs & Integraciones, Bases de Datos, Inteligencia Artificial
- Skills como objetos `{name, description}` con toggle expand/collapse
- Categorías con efecto underline vía IntersectionObserver

### c. Empresas (8 trabajos)
1. New Movement Agency (2025-2026) — Full Stack Developer, AI Integration. Reducción 60% procesamiento manual, 99.9% uptime, +40% SEO rankings.
2. Addiction Marketing Agency (2024-2025)
3. Ciancoders (2024)
4. TREMGROUP LLC (2022-2024)
5. Conocimiento Corporativo S.A.S (2021-2022)
6. Nivelics SAS (2021)
7. ZtGroup LLC (2020-2021)
8. Hispano Soluciones CA (2018-2020)

### d. Proyectos
- 19 proyectos con imágenes optimizadas desde `src/assets/img/`
- Incluye: AI Chatbot RAG (reducción 45% tickets), Real Estate Dashboard (50K+ registros), y 17 proyectos web adicionales
- Grid responsive 1-2-3 columnas

### e. Contacto
- Formulario con validación: Name, Phone, Email, Subject, Message
- Envío via **Resend** (API key, dominio verificado coltmandev.dev)
- Redes sociales: GitHub, Facebook, LinkedIn, X

## 6. Configuración Actual

### Dependencias clave
- `astro` ^5.18.1, `@astrojs/vercel` ^9.0.5 (serverless), `@astrojs/tailwind`
- `three` ^0.184.0, `resend`
- `tailwindcss` ^3.4.19, `typescript` ^6.0.3
- Dev: `vitest`, `@vitest/coverage-v8`

### Scripts
- `npm run dev` - Desarrollo
- `npm run build` - Build producción (output para Vercel)
- `npm run preview` - Preview local del build
- `npm test` / `npm run test:run` / `npm run test:coverage` - Testing

### Variables de Entorno
- `RESEND_API_KEY` - API key de Resend
- `FROM_EMAIL` - contact@coltmandev.dev
- `TO_EMAIL` - Destino del formulario

## 7. SEO y Accesibilidad
- Sitemap XML dinámico (`/sitemap.xml`)
- robots.txt configurado
- Open Graph tags (og:title, og:description, og:image, og:url)
- Canonical URLs
- ARIA labels, roles, keyboard navigation (Escape cierra menú)
- hreflang en links de idioma
- Dark/light mode con persistencia
- SEO por página: titles, descriptions y h1 descriptivos vía traducciones (`seo.pages`, `seo.descriptions`, `seo.h1`)

## 8. Breakpoints Responsivos
| Nombre | Ancho | Cambios |
|---|---|---|
| desktop-large | 1280px+ | Layout por defecto |
| desktop | 1024px | Nav horizontal |
| tablet | 850px | Footer 2-up, layouts apilados |
| tablet-narrow | 768px | Nav hamburger drawer |
| mobile | 640px | Single-column |

## 9. Animaciones
- **AOS (Animate On Scroll)**: Instalado vía npm, CSS importado en global.css, init en BaseLayout con `astro:page-load`
- **Typewriter**: Efecto en h1 de cada sección
- **Underline**: Categorías de skills con animación de subrayado (IntersectionObserver via inline script)
- **View Transitions**: Navegación SPA-like entre páginas con transiciones del navegador

## 10. Notas Técnicas
- Three.js se carga con `import()` dinámico (no bloquea render inicial)
- Imágenes optimizadas con `<Image />` de Astro (WebP, múltiples widths)
- Tests unitarios con Vitest (validación de i18n)
- El adaptador `@astrojs/vercel/serverless` despliega API routes como serverless functions
- El formulario de contacto usa Resend, no Nodemailer
- Todos los scripts cliente usan `is:inline` o `data-astro-rerun` para compatibilidad con View Transitions
- El proyecto se desplegó originalmente como **Next.js en Vercel**; migrado a **Astro 5** con adapter `@astrojs/vercel`

## 11. Roadmap

### ✅ Completados
- Migración de Next.js a Astro 5
- Contacto: migrado Nodemailer → Resend
- Three.js: carga diferida, fallback WebGL, View Transitions cleanup/re-init
- Skills: estructura `{name, description}`, 7 categorías (incluyendo IA)
- SEO: titles, descriptions, h1 por página
- Animaciones: AOS, typewriter, underline en skills
- WhatsApp en contacto
- Dark mode toggle: `data-astro-rerun` + IDs únicas
- Favicon: actualizado a `</>`
- Adapter migrado: `@astrojs/node` → `@astrojs/vercel` (serverless)
- Lighthouse fixes: ARIA i18n, skip link, robots meta, canvas role, numbers.mp4 eliminado

### ⬜ Pendientes
- Deploy en Vercel (pendiente de push al repo y conexión con Vercel)
- Verificar funcionalidad completa en entorno de producción
- Monitorear emails vía Resend en producción

### ✅ Performance Optimizations (26 May 2026)
- **Three.js deferido**: Ahora se carga 800ms después de `window.load` — no bloquea FCP/LCP
- **~36 MB de assets no utilizados eliminados**: `public/videos/` (8 videos, 29 MB), `numbers.mp4` (6.9 MB), `shiba/`, SVGs, flags
- **9 imágenes no utilizadas eliminadas** de `src/assets/img/`
- **`aboutme.jpg`**: cambiado a `loading="eager"` + `fetchpriority="high"`
- **`astro.config.mjs`**: añadido `image.service = sharp` + `vercel({ imageService: true })`
- **Dist size**: 44 MB → 8.4 MB (sin cambios en funcionalidad)

### 🏆 Lighthouse Scores (26 May 2026)

| Categoría | Local (sandbox) | Mobile (real, pre-opt) |
|---|---|---|
| **Performance** | **71** | **61** |
| **Accessibility** | **98** | — |
| **Best Practices** | **100** | — |
| **SEO** | **100** | — |

Mobile score (61) fue antes de las optimizaciones. Pendiente re-evaluar en producción.

### ✅ Fixes aplicados del audit manual
- ARIA labels: 4 hardcoded en español migrados a claves `navigation.*` con traducción EN/ES
- Skip link: añadido como primer elemento focusable en `<body>` con traducción `navigation.skipToContent`
- Three.js canvas: `role="img"` + `aria-label` vía `hero.canvasLabel`
- `<meta name="robots" content="index, follow">` explícito en BaseLayout
- `numbers.mp4` eliminado (archivo no utilizado, ~6.9 MB)
- Heading hierarchy: verificado que cada sección ya renderiza `<h1>` desde `seo.h1.*` — no requiere cambios
