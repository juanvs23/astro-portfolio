# 🗺️ Roadmap: Portafolio Multilingüe con Astro

Documento maestro de desarrollo del portafolio profesional de Juan Carlos Ávila.
Migración desde Next.js → Astro + TypeScript + Tailwind CSS + Three.js.

---

## 📋 Estado Actual del Proyecto

### ✅ Completado
- Astro 5.18.1 instalado
- TypeScript configurado (`astro/tsconfigs/strict`)
- Archivos de traducción: `messages/en.json`, `messages/es.json`
- Tipos TypeScript definidos (`src/types/index.ts`)
- Constantes con datos: 8 trabajos, 21 proyectos, redes sociales, formulario
- Assets en `src/assets/`: imágenes optimizadas con Astro `<Image />`
- `context.md` con documentación completa del proyecto
- `DESIGN.md` con guía de diseño (Berkeley Mono, paleta cremosa, ASCII markers)
- **Fase 0 completada** (Setup y Configuración)
  - Tailwind CSS v3 configurado con tokens de DESIGN.md
  - Three.js + @types/three instalados
  - Resend instalado
  - i18n utilities creadas (`src/i18n/`)
  - Middleware para detección de locale
  - Rutas multilingües configuradas (`/es`, `/en`)
  - Alias `@/*` configurado
- **Fase 1 completada** (Layout y Componentes Base)
  - `BaseLayout.astro` con SEO, OG tags, i18n
  - Componentes UI: Button, Input, Textarea, Badge, Section, AsciiMarker
  - Componentes layout: Header, Footer, LanguageSwitcher, MobileMenu, ThemeToggle, SectionButtons
  - `Layout.astro` actualizado como wrapper completo
- **Fase 2 completada** (Secciones del Portafolio)
  - `HeroSection.astro` con Three.js (burbuja deformable + partículas + cursor tracking)
  - `AboutSection.astro` con imagen, descripción y skills
  - `SkillsSection.astro` con 6 categorías (Frontend, Backend, CMS, DevOps, APIs, DB)
  - `ExperienceSection.astro` con timeline de 8 trabajos
  - `ProjectsSection.astro` con grid de 18 proyectos
  - `ContactSection.astro` con formulario + redes sociales
  - Rutas multilingües: `/es/`, `/en/`
- **Fase 3 completada**
  - **API Route**: `/api/contact` con Resend y validación (`@astrojs/node` adapter)
  - **SEO**: Sitemap dinámico, robots.txt, OG tags, canonical URLs
  - **Accesibilidad**: ARIA labels, roles, keyboard nav, contraste, hreflang
  - **Modo Oscuro**: Toggle con persistencia y tokens invertidos
  - **Three.js optimización**: Dynamic import, bundle reducido de 509KB a 5.71KB
  - **Imágenes optimizadas**: Astro `<Image />` con WebP, reducción promedio 70-90%

### ❌ Pendiente
- ~~Fase 4: Pulido Visual del Home~~ — COMPLETADA (ver abajo)
- ~~Fase 5: AI Automation Showcase~~ — COMPLETADA (ver abajo)
- **Revisión SEO completa** — COMPLETADA y ARCHIVADA (2026-08-18)
  - Merge 3 PRs stacked-to-dev (2026-08-16) → verify PASS WITH WARNINGS (391/391, build OK, 19/19 req, 37/37 escenarios)
  - Archive SDD `seo-complete-review`: 4 specs sincronizadas a `openspec/specs/` + cambio movido a `openspec/changes/archive/2026-08-18-seo-complete-review/`
  - Warnings no bloqueantes: W-1 apply-progress resumido (evidencia de repo sustituye), W-2 deprecación `baseUrl` TS5101 preexistente
- Fase 6: Testing, validación i18n y despliegue a producción

---

## 🎯 Fase 0: Setup y Configuración

**Objetivo:** Instalar dependencias y configurar el entorno base.

### Tareas

- [x] **0.1 Instalar dependencias principales**
  ```bash
  npm install @astrojs/tailwind tailwindcss@3 three @types/three resend @tailwindcss/postcss
  ```

- [x] **0.2 Configurar `astro.config.mjs`**
  - Agregar integración `@astrojs/tailwind`
  - Configurar rutas i18n (locales: `es`, `en`, locale prefix: `always`)
  - Configurar alias `@/*` → `src/*`

- [x] **0.3 Configurar Tailwind CSS**
  - Crear `tailwind.config.js` con tokens de `DESIGN.md`:
    - Colores: canvas, ink, charcoal, body, mute, stone, ash, surface-soft, surface-card, surface-dark, hairline
    - Tipografía: fontFamily mono (Berkeley Mono → JetBrains Mono → IBM Plex Mono → fallback)
    - Spacing: xxs(1px), xs(4px), sm(8px), md(12px), lg(16px), xl(24px), xxl(32px), section(96px)
    - BorderRadius: none(0px), sm(4px), full(9999px)
  - Crear `src/styles/global.css` con @tailwind directives y estilos base

- [x] **0.4 Configurar i18n para Astro**
  - Crear `src/i18n/utils.ts` — utilidades de locale y rutas
  - Crear `src/i18n/translations.ts` — carga de traducciones desde `messages/*.json`
  - Crear `src/i18n/index.ts` — exports del módulo
  - Crear `src/middleware.ts` — detección automática de locale

- [x] **0.5 Limpiar código heredado de Next.js** — No hay residuos de Next.js

---

## 🏗️ Fase 1: Layout y Componentes Base

**Objetivo:** Crear la estructura visual y componentes reutilizables siguiendo `DESIGN.md`.

### Tareas

- [x] **1.1 Layout principal (`src/layouts/BaseLayout.astro`)**
  - HTML5 semántico con lang dinámico según locale
  - Meta tags SEO (title, description, OG, favicon)
  - Font-face para Berkeley Mono / JetBrains Mono
  - Tailwind base styles
  - Slot para contenido

- [x] **1.2 Componentes UI atómicos (`src/components/ui/`)**
  - `Button.astro` — primary, secondary, tab variants (DESIGN.md tokens)
  - `Input.astro` — text input con estados default/focused/error
  - `Textarea.astro` — multi-line input
  - `Badge.astro` — badge-news, badge-section-label
  - `Section.astro` — contenedor con hairline border y section spacing (96px)
  - `AsciiMarker.astro` — `[+]`, `[-]`, `[x]` como bullets

- [x] **1.3 Componentes de layout (`src/components/layout/`)**
  - `Header.astro` — nav con ASCII wordmark, links, language switcher
  - `Footer.astro` — link grid, copyright, utility links
  - `LanguageSwitcher.astro` — selector ES/EN
  - `MobileMenu.astro` — hamburger drawer para tablet-narrow/mobile

- [x] **1.4 Actualizar `src/layouts/Layout.astro`**
  - Reemplazar template por defecto con `BaseLayout.astro`

---

## 🎨 Fase 2: Secciones del Portafolio

**Objetivo:** Implementar las 5 secciones principales como componentes reutilizables.

### Tareas

- [x] **2.1 Sección Hero + Three.js (`src/components/sections/HeroSection.astro`)**
  - Three.js: burbuja deformable con cursor tracking + partículas
  - Escena 3D interactiva con mouse/touch tracking
  - Cursor restringido a 25% del viewport
  - Fondo dark surface (#201d1d) como DESIGN.md

- [x] **2.2 Sección Quién Soy (`src/components/sections/AboutSection.astro`)**
  - Imagen: `src/assets/img/aboutme.jpg` (optimizada con `<Image />`)
  - Título bilingüe desde `messages/*.json`
  - Descripción bilingüe desde `messages/*.json`
  - Lista de skills con ASCII markers `[+]`
  - Layout: grid 320px + texto en desktop, apilado en mobile

- [x] **2.3 Sección Skills (`src/components/sections/SkillsSection.astro`)**
  - 6 categorías: Frontend, Backend, CMS, DevOps, APIs, DB
  - Grid 1-2-3 columnas responsive
  - Estilo: hairline-bordered cards con ASCII markers

- [x] **2.4 Sección Empresas (`src/components/sections/ExperienceSection.astro`)**
  - Timeline de 8 trabajos con fechas formateadas
  - Datos desde `messages/*.json` vía `getTranslations()`
  - Estilo: hairline-bordered rows con ASCII markers `[+]`/`[x]`

- [x] **2.5 Sección Proyectos (`src/components/sections/ProjectsSection.astro`)**
  - Grid de 18 proyectos con imagen, nombre, URL
  - Cards con hover effect y border transition
  - Imágenes desde `src/assets/img/` con `<Image />` de Astro

- [x] **2.6 Sección Contacto (`src/components/sections/ContactSection.astro`)**
  - Formulario: Full Name, Phone, Email, Subject, Message
  - Submit a `/api/contact` (Fase 3)
  - Estados: sending, success, error
  - Links a redes sociales (GitHub, Facebook, LinkedIn, X)
  - Layout: 2 columnas (formulario + social)

---

## ⚙️ Fase 3: Integración y Funcionalidades

**Objetivo:** Conectar formularios, optimizar rendimiento y configurar API routes.

### Tareas

- [x] **3.1 API Route para contacto (`src/pages/api/contact.ts`)**
  - Endpoint POST para enviar emails con Resend
  - Validación de datos en servidor
  - Respuesta JSON con estado (success/error)
  - Variables de entorno: RESEND_API_KEY, FROM_EMAIL, TO_EMAIL
  - Dominio verificado: coltmandev.dev
  - Email: contact@coltmandev.dev
  - Adapter @astrojs/node configurado

- [x] **3.2 Optimización de imágenes**
  - Imágenes movidas de `public/img/` a `src/assets/`
  - `<Image />` de Astro con conversión automática a WebP
  - Múltiples widths para responsive images
  - Reducción promedio: 70-90% en tamaño
  - Lazy loading para imágenes de proyectos

- [x] **3.3 Three.js optimización**
  - Dynamic import() para carga diferida
  - Bundle HeroSection: 509KB → 5.71KB (98% reducción)
  - Three.js en chunk separado (carga bajo demanda)
  - Fallback: canvas no bloquea renderizado inicial

- [x] **3.4 SEO y Meta Tags**
  - Datos SEO desde `messages/*.json` (`seo.title`, `seo.description`)
  - Open Graph tags por página (og:title, og:description, og:image, og:url)
  - Sitemap XML generado dinámicamente (`/sitemap.xml`)
  - Robots.txt configurado
  - Canonical URLs

- [x] **3.5 Accesibilidad**
  - ARIA labels en componentes interactivos (nav, buttons, forms)
  - Navegación por teclado (Escape cierra menú móvil)
  - Contraste de colores según DESIGN.md
  - Lang attribute dinámico + hreflang en links de idioma
  - Roles ARIA (navigation, dialog, group)
  - aria-expanded en botón de menú móvil

- [x] **3.6 Modo Oscuro**
  - Toggle dark/light en Header y Hero
  - Persistencia en `localStorage` + detección `prefers-color-scheme`
  - Tokens invertidos: canvas ↔ surface-dark, ink ↔ on-dark
  - Three.js background transparente (adaptativo al CSS)
  - Transición suave entre modos

---

## 🚀 Fase 6: Testing y Lanzamiento

**Objetivo:** Validar, optimizar y desplegar en producción.

### Tareas

- [x] **4.1 Testing automatizado**
  - Vitest configurado con `vitest.config.ts`
  - Tests de i18n: validación de traducciones ES/EN
  - Scripts: `npm test`, `npm run test:run`, `npm run test:coverage`
  - Cobertura con `@vitest/coverage-v8`

- [x] **4.2 Testing manual (parcial)**
  - ~~Navegación entre secciones (desktop, tablet, mobile)~~ *(pendiente)*
  - ~~Selector Three.js funcional en todos los navegadores~~ *(pendiente)*
  - ✅ Formulario de contacto envía emails correctamente
  - ~~Language switcher cambia contenido ES ↔ EN~~ *(pendiente)*
  - ~~Links externos abren correctamente~~ *(pendiente)*

- [x] **4.3 Performance (parcial)**
  - `npm run build` — output size verificado ✅
  - ~~Lighthouse: Performance > 90, Accessibility > 90, SEO > 90~~ *(pendiente)*
  - ✅ Optimizar carga de Three.js (code splitting, lazy load)
  - ✅ Minificar CSS y JS

- [ ] **4.4 Validación de i18n**
  - Todas las traducciones ES/EN completas
  - URLs con prefijo de locale (`/es/about`, `/en/about`)
  - Fallback a ES si falta traducción EN

- [x] **4.5 Despliegue (parcial)**
  - ✅ Adapter `@astrojs/vercel` configurado
  - ✅ Variables de entorno documentadas en `.env.example`
  - ✅ Build exitoso en Vercel
  - [ ] Despliegue final en producción
  - [ ] CI/CD con GitHub Actions (opcional)

---

## 🎯 Fase 4.5: Lead Capture Funnel + n8n + SweetAlert2

**Objetivo:** Integrar captura de leads con webhook n8n, modal de confirmación con SweetAlert2 y confeti, y almacenamiento en MongoDB.

### Tareas

- [x] **4.5.1 LeadForm.astro — Captura de leads**
  - Formulario con nombre + email + source (`audit` | `contact`)
  - Validación de nombre requerido
  - Botón WhatsApp con `e.preventDefault()` y fetch asíncrono
  - `data-wa-number`, `data-wa-message`, `data-source` por formulario

- [x] **4.5.2 API proxy `/api/lead`**
  - Endpoint POST en `src/pages/api/lead.ts`
  - Recibe `{name, email, source}`, forward a n8n webhook con Basic Auth
  - Fire-and-forget: siempre devuelve `{success: true}` al frontend
  - Variables de entorno: `PUBLIC_N8N_LEAD_WEBHOOK`, `N8N_AUTH_USER`, `N8N_AUTH_PASS`

- [x] **4.5.3 SweetAlert2 + Canvas Confetti**
  - Dependencias: `sweetalert2`, `canvas-confetti`
  - Modal monocromático (surface-soft, ink, hairline, 4px radius, Berkeley Mono)
  - Confeti en 3 bursts (izquierda, derecha, centro)
  - Botón "Hablar por WhatsApp" → `window.open(waUrl, '_blank')`
  - Carga dinámica de CDN desde `is:inline` para evitar conflictos con Vite/Astro

- [x] **4.5.4 Workflow n8n: Webhook → MongoDB**
  - Webhook POST con Basic Auth (credenciales desde variables de entorno — ver `.env`, no versionado)
  - Code node con `mongodb` directo: inserta `{name, email, source, createdAt}` en `leads.leads`
  - Workflow activo en producción (`/webhook/`, no `/webhook-test/`)
  - MongoDB: host, base y credenciales documentados en `.env` (variables `MONGO_*`)

- [x] **4.5.5 Documentación**
  - `.env.example` actualizado con `N8N_AUTH_USER`, `N8N_AUTH_PASS`, `PUBLIC_N8N_LEAD_WEBHOOK`
  - `context.md` actualizado con sección Lead Capture

### Variables de Entorno Nuevas

Definidas en `.env` (no versionado). Ver `.env.example` con placeholders:

```env
PUBLIC_N8N_LEAD_WEBHOOK=your-n8n-webhook-url
N8N_AUTH_USER=your-auth-user
N8N_AUTH_PASS=your-auth-pass
# MongoDB (workflow n8n, no la usa la app Astro directamente)
MONGO_HOST=host:port
MONGO_DB=leads
MONGO_COLLECTION=leads
MONGO_AUTH_USER=admin
MONGO_AUTH_PASS=your-mongo-pass
```

---

## 📁 Estructura Final Esperada

```
src/
├── assets/
│   └── img/              # Imágenes importadas (optimizadas por Astro)
├── components/
│   ├── ui/               # Button, Input, Textarea, Badge, Section, AsciiMarker
│   ├── layout/           # Header, Footer, LanguageSwitcher, MobileMenu
│   └── sections/         # HeroSection, AboutSection, SkillsSection,
│                         # ExperienceSection, ProjectsSection, ContactSection
├── constants/            # Datos estáticos (jobs, proyectos, redes)
├── i18n/                 # Utilidades de internacionalización
├── layouts/              # BaseLayout.astro
├── pages/
│   ├── index.astro       # Homepage con Three.js hero
│   ├── [locale]/         # Rutas multilingües
│   │   ├── index.astro
│   │   └── ...
│   └── api/
│       └── contact.ts    # Endpoint para formulario (Resend)
├── types/                # Interfaces TypeScript
└── styles/               # Global styles, Tailwind imports
```

---

## 🔧 Notas Técnicas

### Migración Next.js → Astro
| Next.js | Astro |
|---------|-------|
| `useTranslations` (next-intl) | Función custom `getTranslations(locale)` |
| React components | Astro components (`.astro`) |
| `client:only="react"` | Solo para componentes React existentes |
| API routes (`/pages/api/`) | Astro endpoints (`src/pages/api/`) |
| `next/image` | `<Image />` de Astro |
| `next/head` | `<head>` en layout Astro |

### Directrices de Diseño (DESIGN.md)
- **Fuente:** 100% monoespaciada (Berkeley Mono → JetBrains Mono)
- **Fondo:** `#fdfcfc` (canvas cream) — único background
- **Sin:** sombras, gradientes, imágenes decorativas
- **Markers:** ASCII `[+]`, `[-]`, `[x]` como bullets/iconos
- **Secciones:** separadas por hairline rules de 1px, 96px de ritmo
- **Superficie dark:** solo una por página (`#201d1d` para hero TUI)

### Breakpoints
| Nombre | Ancho | Cambios |
|---|---|---|
| desktop-large | 1280px+ | Layout por defecto |
| desktop | 1024px | Nav horizontal |
| tablet | 850px | Footer 2-up, layouts apilados |
| tablet-narrow | 768px | Nav hamburger drawer |
| mobile | 640px | Single-column, display 38px → 28px |

---

## 🎨 Fase 4: Pulido Visual del Home

**Estado: COMPLETADA (2026-08-14).** Implementada vía SDD `home-visual-polish` (verify PASS: 341 tests, LCP 1766ms) + trabajo directo de la sesión 14/08 (jerarquía de encabezados WCAG, escala tipográfica unificada, nav de funnel, About hub, SectionHeading reutilizable). Nota: las animaciones se hicieron con **Motion One** (~5KB) en vez de GSAP (~47KB) — decisión de sesión por performance.

### Tareas

- [x] **4.1 Imágenes reales en el home**
  - Reemplazados los placeholders: About/Skills/Capture → terminales interactivas (TerminalWindow/AuditTerminal), Projects → tabs interactivos con ProjectItem real
- [x] **4.2 Animaciones con GSAP**
  - Hecho con Motion One (`motion` ~5KB gzip, dynamic import): scroll reveals + CTA pulse + reduced-motion guard
- [x] **4.3 Mejora del Hero**
  - Rediseñado: h1 typewriter, lateral matrix canvas 2D, fade-in en cadena, cursor invert-blend scoped al hero, sin gradientes

---

## 🤖 Fase 5: AI Automation Showcase

**Objetivo:** Agregar página de automatización con IA y preparar el portfolio para mostrar demos de automatización (sin backend externo aún).

**Contexto:** No hay automatizaciones reales de clientes (NDA/privacy). Los demos se construirán como proyectos open source separados. Esta fase prepara el portfolio para mostrarlos cuando existan.

**Estado: COMPLETADA (2026-08-14).** Decisiones tomadas:
- La página se muestra con un **ChatbotMock** (demo interactiva sin conexión a modelo) — no se inventan demos/proyectos falsos.
- 5.1/5.2 **descartados** (no hay proyectos de IA reales aún — YAGNI; reintroducir `projects.ts` con categorías cuando existan demos open source).
- El nav se mantiene mínimo por estrategia de funnel; `/automation` se enlaza desde home y `/services` (no desde el nav).

### Tareas

- [x] **5.1 Data model de proyectos (`src/constants/projects.ts`)** — DESCARTADO (no hay proyectos IA)
- [x] **5.2 Refactor ProjectsSection.astro** — DESCARTADO (no hay categorías reales que filtrar)
- [x] **5.3 StatsGrid component** — IMPLEMENTADO inline en AutomationSection (4 stats: Agents, Automations, Reducción, Años)
- [x] **5.4 Automation page (`src/pages/[locale]/automation.astro`)** — CREADA (patrón services.astro, prerender, ambos locales)
- [x] **5.5 AutomationSection component** — CREADO (intro + beneficios + ChatbotMock + stats + 4 servicios + CTA WhatsApp)
- [x] **5.6 i18n** — COMPLETADA (sección `automation` + SEO keys es/en; traducciones de proyectos AI no aplican sin data model)
- [x] **5.7 Navegación + Layout** — NO APLICA al nav (funnel); en su lugar CTAs contextuales desde home/services

---

## 🔍 Revisión SEO Completa — MERGEADA (2026-08-16)

**Estado (2026-08-15):** SDD change `seo-complete-review` — proposal + 4 specs + design + tasks aprobados. **Implementación 19/21 tareas completada** en 3 PRs stacked-to-dev (pendientes de merge en orden PR 1 → PR 2 → PR 3; luego verify 4.1/4.2 + archive).

**Decisiones de entrega (2026-08-15):** forecast 800–900 líneas > budget 400 → chained PRs con chain strategy **stacked-to-dev** (cada PR mergea a `dev` en orden, no a main). PR 1 jsonld+head-meta, PR 2 sitemap, PR 3 copy.

**Objetivo:** cerrar gaps SEO verificados (sin dependencias nuevas, strict TDD).

### PR 1 — JSON-LD + Head Meta (`feat/seo-jsonld-head-meta` → PR #1)

- [x] **JSON-LD schema.org** — Person + ProfessionalService en TODAS las páginas (vía `JsonLd.astro` + `buildSiteJsonLd`), FAQPage solo en home (desde `t('funnel.faq')`, paridad UI/schema). `src/constants/site-info.ts` como single source of truth (sameAs derivado de social-links)
- [x] **Head meta** — og:site_name, twitter:site (@juanvs23), hreflang es/en en `<head>`, og:image por locale (og-image-es/en.jpg, 1200x630) + og:image:alt (`seo.ogImageAlt`, valor provisional hasta PR 3)
- [x] **`site` config** — `site: 'https://coltmandev.dev'` en astro.config.mjs; canonical/og:url migrados a `Astro.site` (fallback `new URL('https://coltmandev.dev')` si undefined)
- [x] **BaseLayout** — head completo + inyección JSON-LD; removido `/og-image.jpg` heredado
- [x] **Tests** — 21 nuevos (site-info 5, jsonld 9, head-meta 7); suite 362/362; build OK + spot-check dist
- [x] **og-image es/en creadas** — `public/og-image-es.jpg` + `public/og-image-en.jpg` (1200x630, ~45KB). Prompt en `docs/og-image-prompt.md`

### PR 2 — Sitemap (`feat/seo-sitemap` → PR #2)

- [x] **Sitemap** — `/services` + `/automation` agregados; xhtml:link hreflang alternates; namespaces conservan lastmod/changefreq/priority; root weekly/1.0. `src/lib/seo/sitemap.ts` (builders puros autocontenidos) + `sitemap.xml.ts` endpoint con `({ site })` + fallback
- [x] **Tests** — 16 nuevos (lib 14 + endpoint 2); suite 357/357; build OK; runtime GET /sitemap.xml → 200, 16 entries, 32 alternates

### PR 3 — Copy SEO por intención (`feat/seo-copy` → PR #3)

- [x] **Copy SEO por intención** — revisar `seo.*` es/en: services→precios, automation→IA, projects→casos, about→E-E-A-T, contact→conversión; guard anti-métricas inventadas (numeric claims ⊆ números reales del sitio)
- [x] **i18n guards** — 13 tests (symmetry es/en, no-voseo en `seo`, ogImageAlt ≠ descriptions, numeric claims); suite 354/354
- [x] **`seo.ogImageAlt`** — agregado en es/en (resuelve referencia de BaseLayout del PR 1 post-merge)

### Pendiente del cambio

- [x] **Merge de la cadena** — PR 1 → PR 2 → PR 3 mergeados a `dev` (2026-08-16; PR3 requirió resolver conflicto en messages es/en, resuelto tomando copy de PR3)
- [x] **Verify final** — 4.1 suite completa post-merge (`npx vitest run` 391/391) + 4.2 `npm run build` + spot-check dist (2026-08-18)
- [x] **Archive** — specs sincronizadas a `openspec/specs/` + cambio movido a `openspec/changes/archive/2026-08-18-seo-complete-review/` + este roadmap y `context.md` marcados (2026-08-18)

### Artefactos

Archivado en `openspec/changes/archive/2026-08-18-seo-complete-review/` (proposal.md, design.md, tasks.md, specs/{seo-jsonld,seo-head-meta,seo-sitemap,seo-copy-intent}/spec.md, verify-report.md, archive-report.md) + specs sincronizadas en `openspec/specs/{seo-jsonld,seo-head-meta,seo-sitemap,seo-copy-intent}/` + Engram `sdd/seo-complete-review/*`.

---

**Nota:** Este roadmap es dinámico. Las tareas se marcarán como completadas conforme avance el desarrollo.
