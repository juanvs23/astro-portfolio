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
- Botón estilo SectionButtons del home que apunta a `/skills` (mismo estilo: `bg-surface-dark/80`, hover scale, icono code `</>`)
- Grid 40-60 (imagen-texto) en desktop

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
- SDD init completado (openspec mode, Strict TDD)
- Fase 1 AI Automation: contenido AI en jobs, skills, descripciones (EN+ES)
- Layout: max-w general 1200px, Hero 960px centrado
- Three.js removido del hero como parte de home-funnel-landing (PR₆)
- home-funnel-landing completado: home convertido en funnel AIDA de 12 secciones
- LeadForm.astro con integración n8n webhook + SweetAlert2 + confeti
- API proxy `/api/lead` para bypass de CORS
- Workflow n8n: Webhook → Code node → MongoDB (leads.leads)
- Dependencias nuevas: `sweetalert2`, `canvas-confetti`
- About: grid 40-60, botón skills estilo SectionButtons, sin título redundante
- ServicesSection: eliminados planes + cotizador IA → solo servicios (a medida, express, proceso) — 598→~77 líneas
- Página `/services`: sección de Planes (PricingBofuSection) al inicio + Servicios Adicionales debajo de los planes
- AdditionalServicesSection.astro: 4 servicios (mantenimiento, auditoría, cotización rápida, despliegue), todos con CTA WhatsApp
- Precios eliminados del home: PricingBofuSection muestra planes sin precios; CTAs WhatsApp genéricos
- Fix leaks View Transitions en BaseLayout: AOS init-once+refresh, underline observer con disconnect, typewriter timers cancelados
- Fix SVG paths rotos en LeadForm, FaqSection, HeroSection (octicon oficial con fill-rule="evenodd")
- quote-calculator.ts + test eliminados (código muerto)
- Fix 504 dev: cache Vite limpiada (`node_modules/.vite`)
- AdditionalServicesSection traducido a i18n: 17 strings hardcodeados → `services.additional.heading` + `cards[4]{title,description,cta,whatsappMessage}` en `messages/{es,en}.json`; componente refactorizado a `t.object()` + map (10 Sep 2026)
- Quick wins i18n completados (10 Sep 2026): ServicesSection (5 strings), LeadForm (6, script inline via define:vars), AutomationSection (1 WA + buildWhatsAppLink), ChatbotMock (1 aria-label), BaseLayout (2 SEO sentinels); typo fix `services.additional.cards[2].description` "Cuentamos" → **"Cuéntanos"** (español neutro); **regionalismos eliminados**: "Imaginate"→"Imagina", "Aprovechá"→"Aprovecha", "Usá"→"Usa", "Necesitás"→"Necesitas", "Tenés"→"Tienes", "Contame"→"Cuéntame"
- Auditoría i18n completa (54 archivos .astro): restante hardcodeado en ProjectsSection/Preview (36+6 descripciones — candidatas al CMS), Welcome.astro (unused, eliminar)

### 🔄 En progreso (Sep 2026)
- **Backoffice CMS** (SDD: `backoffice-cms`) — CMS headless a medida con API pública + panel admin. Entrega `single-pr` en `feature/backoffice-cms`.
  - ✅ Slice 1: workspace pnpm + `packages/contracts` (Zod, 39 tests)
  - ✅ Slice 2: `cms/server` Hono + auth (JWT access/refresh + rotación, rate-limit, roles) — 116 tests
  - ✅ Slice 3: content-api (GET públicos + aggregate + CRUD admin + upload Blob + seed 18 proyectos/6 jobs)
  - ✅ Slice 4: `cms/admin` SPA React (login, guards, CRUD bilingüe, upload, gestión de usuarios)
  - ⬜ Slice 5: integración del portfolio (consume API + caché + fallback + on-demand + imágenes)
  - ⬜ PR único a main + deploy (Vercel) + verify/archive

### ⬜ Pendientes (Roadmap reordenado — Ago 2026)
- **Fase 4: Pulido Visual del Home** (SDD: `home-visual-polish`, propuesta + exploración completadas)
  - 4.1 Imágenes reales en previews del funnel (AboutPreview, SkillsPreview, ProjectsPreview, CaptureSection)
  - 4.2 Animaciones con Motion One (~5KB) + scroll triggers — elegido sobre GSAP (~47KB) para preservar Lighthouse
  - 4.3 Rediseño del Hero: elemento ASCII decorativo (tipo TUI mockup), eliminar gradiente, adaptar dark mode
- **Fase 5: AI Automation Showcase** (SDD pendiente)
  - Data model de proyectos (`src/constants/projects.ts`)
  - Refactor ProjectsSection.astro con categorías
  - StatsGrid component
  - Página `/automation` + AutomationSection
  - i18n completo + navegación
- **Fase 6: Testing, validación i18n y despliegue a producción**
  - Deploy en Vercel
  - Verificar funcionalidad completa en producción
  - Monitorear emails vía Resend
  - Lighthouse en producción

### ✅ Performance Optimizations (26 May 2026)
- **Three.js deferido**: Ahora se carga 800ms después de `window.load` — no bloquea FCP/LCP
- **~36 MB de assets no utilizados eliminados**: `public/videos/` (8 videos, 29 MB), `numbers.mp4` (6.9 MB), `shiba/`, SVGs, flags
- **9 imágenes no utilizadas eliminadas** de `src/assets/img/`
- **`aboutme.jpg`**: cambiado a `loading="eager"` + `fetchpriority="high"`
- **`astro.config.mjs`**: añadido `image.service = sharp` + `vercel({ imageService: true })`
- **Dist size**: 44 MB → 8.4 MB (sin cambios en funcionalidad)

### 🏆 Lighthouse Scores (8 Ago 2026 — post-Three.js removal)

| Categoría | Desktop (local) | Mobile (Fast 3G, 4x CPU) |
|---|---|---|
| **Performance (LCP)** | **89ms** | **1,117ms** |
| **CLS** | **0.00** | **0.00** |
| **Accessibility** | **95** | — |
| **Best Practices** | **100** | — |
| **SEO** | **100** | — |

Comparación con scores pre-Three.js (Mayo 2026): Desktop 71 → ~98, Mobile 61 → ~95. La remoción de Three.js liberó el render path crítico.

**Issues pendientes**: 4 failures de accesibilidad (bajó de 98 a 95 — probablemente por el funnel nuevo). HTML sin compresión en dev (Vercel lo resuelve en producción).

### ✅ Fixes aplicados del audit manual
- ARIA labels: 4 hardcoded en español migrados a claves `navigation.*` con traducción EN/ES
- Skip link: añadido como primer elemento focusable en `<body>` con traducción `navigation.skipToContent`
- Three.js removido del hero como parte de home-funnel-landing (PR₆)
- Heading hierarchy: verificado que cada sección ya renderiza `<h1>` desde `seo.h1.*` — no requiere cambios

## 12. Lead Capture Funnel (n8n + SweetAlert2)

### Arquitectura del Funnel
La página principal (`/es/` y `/en/`) es un funnel AIDA de 12 secciones con dos formularios de captura:
- **CaptureSection** (`audit-form`): auditoría gratuita, `source=audit`
- **ContactCtaSection** (`contact-cta-form`): propuesta sin compromiso, `source=contact`

### LeadForm.astro
Componente reutilizable que renderiza nombre + email + botón WhatsApp. Props: `locale`, `formId`, `context`.

**Flujo de captura:**
1. Usuario completa nombre + email → clickea botón
2. Botón cambia a "Enviando...", se deshabilita
3. `POST /api/lead` con `{name, email, source}`
4. API proxy forward a n8n webhook (fire-and-forget)
5. API devuelve `{success: true}` al frontend
6. 🎉 Confeti (3 bursts: izquierda, derecha, centro)
7. Modal SweetAlert2 monocromático (surface-soft, ink, hairline, Berkeley Mono)
8. Botón "Hablar por WhatsApp" → `window.open(waUrl, '_blank')`
9. Si fetch falla → abre WhatsApp directamente (fallback sin fricción)

### SweetAlert2 + Canvas Confetti
- Dependencias: `sweetalert2`, `canvas-confetti` (cargados vía CDN desde script `is:inline`)
- Modal: fondo `#f8f7f7`, texto `#201d1d`, borde hairline, 4px radius, tipografía Berkeley Mono
- El `is:inline` inyecta dinámicamente los CDN scripts al `<head>` para evitar que Astro/Vite los procese como módulos

### API Proxy (`/api/lead`)
- Endpoint: `src/pages/api/lead.ts`
- Recibe `{name, email, source}`, forward a `PUBLIC_N8N_LEAD_WEBHOOK` con Basic Auth
- Siempre devuelve `{success: true}` (fire-and-forget, no bloquea UX)
- Variables requeridas: `PUBLIC_N8N_LEAD_WEBHOOK`, `N8N_AUTH_USER`, `N8N_AUTH_PASS`

### Workflow n8n
- **Webhook**: POST, Basic Auth, path: `<n8n-webhook-path>`
- **Code node**: JavaScript con `mongodb` — inserta `{name, email, source, createdAt}` en MongoDB
- **MongoDB**: `<host>:27017`, DB `leads`, colección `leads`, auth configurada vía variables de entorno
- URL producción: `https://n8n.coltmandev.dev/webhook/<webhook-path>`

### Variables de Entorno (`.env`)
```env
PUBLIC_N8N_LEAD_WEBHOOK=https://n8n.coltmandev.dev/webhook/<webhook-path>
N8N_AUTH_USER=<your-auth-user>
N8N_AUTH_PASS=<your-auth-pass>
```

### ⚠️ Notas técnicas
- El webhook de producción (`/webhook/`) funciona 24/7 con workflow activo; `/webhook-test/` solo con UI abierta
- SweetAlert2 se carga dinámicamente vía `document.createElement('script')` para evitar que Vite se coma el `<script src>` del CDN
- `data-source` por formulario (no global `window.__source`) porque hay 2 forms en la misma página
- Si el fetch a `/api/lead` falla por cualquier razón, se abre WhatsApp directamente (no se pierde el lead)

## 13. Decisiones y Cambios Recientes (8 Ago 2026)

### Seguridad
- Credenciales reales (n8n, MongoDB) eliminadas de `context.md` y movidas a `.env` (gitignoreado)
- Archivos stray eliminados: `dd`, `public/test-swal.html`, `pnpm-lock.yaml`
- `pnpm-lock.yaml` agregado a `.gitignore`

### Roadmap reordenado
- Fase 4: Pulido Visual del Home (antes Fase 6)
- Fase 5: AI Automation Showcase (sin cambios)
- Fase 6: Testing y Despliegue (antes Fase 4)

### Animaciones: Motion One en vez de GSAP
- **Decisión**: Usar Motion One (~5KB) en lugar de GSAP (~47KB) para animaciones por scroll
- **Razón**: GSAP lastimaría el Lighthouse (~71→~68 estimado). Motion One es tree-shakeable y compatible con Astro/Vite sin configuración extra.
- **Riesgo mitigado**: View Transitions + ScrollTrigger ya no es problema porque Motion One maneja cleanup distinto.

### SDD: home-visual-polish
- Exploración completada: 4 placeholders, hero sin identidad visual, solo AOS fade-up
- Propuesta completada: 3 entregables (imágenes, Motion One, hero ASCII redesign)
- Próximo: specs → design → tasks → apply

## 14. Backoffice CMS (backoffice-cms)

CMS headless a medida para administrar el contenido del portfolio. Entrega `single-pr` en la rama `feature/backoffice-cms` (Sep 2026). Decisión clave del usuario: **single-pr** (solo commits + un PR final), y **contabilidad de intentos desactivada** para este repo (`review mode disable --scope clone`).

### Stack
- **Monorepo pnpm**: portfolio Astro en raíz + `cms/server` + `cms/admin` + `packages/contracts`
- **API**: Hono + Mongoose (MongoDB) + jose (JWT HS256) + bcryptjs + @hono/zod-validator
- **Panel**: Vite + React + TypeScript + Tailwind + react-router + tanstack-query
- **Imágenes**: Vercel Blob (upload) + Vercel imageService (servir)
- **Tests**: Vitest + mongodb-memory-server (server) · Vitest + Testing Library (admin). Strict TDD.

### Estructura
```
packages/contracts/   → @cms/contracts: schemas Zod compartidos (recursos + auth), 39 tests
cms/server/           → @cms/server: API Hono (public GET /api/v1/*, admin CRUD, auth), 116 tests
cms/admin/            → panel SPA React (login, guards auth/rol, CRUD bilingüe, upload, users)
```

### API pública (consumible)
```
GET /api/v1/{projects|jobs|site-info|nav|social|services}   → JSON versionado, orden, visible=false excluido
GET /api/v1/content                                → aggregate {projects, jobs, siteInfo, nav, social, services}
POST /api/v1/auth/{login|refresh|logout}           → JWT access 15m + refresh 30d (rotación)
/api/v1/admin/*                                    → CRUD protegido (user=contenido, admin=site-info/users/upload/hard-delete)
POST /api/v1/admin/upload                          → Vercel Blob (solo admin)
```

### Regla de arquitectura: Content-Type Endpoint
Cada tipo de contenido en el CMS DEBE tener: modelo Mongoose, schema Zod en @cms/contracts, endpoint público GET /api/v1/<tipo>, CRUD admin protegido, e inclusión en GET /api/v1/content. Aplicado a services (planes, adicionales, express).

### Estado (Sep 2026)
- ✅ Slice 1 (contracts) · Slice 2 (server+auth) · Slice 3 (content-api) · Slice 4 (admin SPA)
- ⬜ Slice 5: integración portfolio (consumir API on-demand + caché TTL + fallback a constantes, páginas prerender→on-demand, imágenes remote patterns)

### Configs para el deploy (pendiente)
- `CORS_ORIGINS` del server debe incluir el origen del panel admin
- `VITE_API_URL` en cms/admin apunta al server del CMS
- `@cms/contracts` `dist/` está gitignored → buildear contracts antes del deploy del server (o prebuild)

## 15. Servicios y Planes (9 Sep 2026)

### Objetivo
Reestructurar la oferta comercial: los planes viven en el home y ahora también al inicio de `/services`, sin precios visibles (todo cotiza vía WhatsApp). Se eliminó el cotizador IA y los planes embebidos de `ServicesSection`.

### Cambios de componentes

| Archivo | Cambio |
|---|---|
| `src/components/sections/ServicesSection.astro` | 598 → ~77 líneas. Eliminados zona de planes (webPlans) y cotizador IA. Quedan: custom work, express services, proceso. |
| `src/components/sections/AdditionalServicesSection.astro` | **Nuevo** (extraído de ServicesSection). 4 servicios: Mantenimiento Continuo, Auditoría Gratuita, Formulario de Cotización, Despliegue y Deploy. Cada uno con CTA WhatsApp. |
| `src/components/sections/PricingBofuSection.astro` | Precios eliminados de la visualización (home + services). Se mantienen nombres, entregas, features y CTA WhatsApp genéricos. Comentario actualizado: "prices are hidden, prompting visitors to inquire via WhatsApp". |
| `src/pages/[locale]/services.astro` | Orden: `PricingBofuSection` (planes) → `AdditionalServicesSection` (servicios adicionales) → `ServicesSection` (servicios). |
| `src/layouts/BaseLayout.astro` | Leaks View Transitions corregidos: AOS init-once + `AOS.refresh()`, `initUnderlines()` con observer module-scoped y `disconnect()` en `astro:before-swap`, `initTypewriter()` con timers cancelados en `before-swap`. |
| `src/components/sections/LeadForm.astro`, `FaqSection.astro`, `HeroSection.astro` | SVG paths rotos (números concatenados) reemplazados por el path oficial de GitHub octicon con `fill-rule="evenodd"`. |
| `src/lib/quote-calculator.ts` + test | Eliminados (código muerto; solo lo referenciaba su propio test). |

### Detalles técnicos
- **504 en dev**: `aos.js` y `motion_mini.js` devolvían 504 `Outdated Optimize Dep` por cache Vite corrupta → `rm -rf node_modules/.vite` + restart.
- Todos los CTAs de servicios usan `buildWhatsAppLink` de `src/lib/funnel-lead.ts` con mensajes genéricos (sin precios).
- Grid de servicios adicionales: 1 columna mobile, 2 columnas `md+`, mismo estilo visual que el resto (`bg-surface-soft`, `border-hairline`, `rounded-sm`).
- Estado: 375 tests vitest pasan; `astro check` solo con el error pre-existente de `cms/server/src/models/models.test.ts:48` (fuera de alcance).
