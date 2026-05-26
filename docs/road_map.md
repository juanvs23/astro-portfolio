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
- Testing automatizado y despliegue (Fase 4)

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

## 🚀 Fase 4: Testing y Lanzamiento

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

- [ ] **4.5 Despliegue**
  - Configurar adapter de Astro (`@astrojs/node` ya instalado)
  - Variables de entorno en plataforma de despliegue
  - Dominio custom configurado
  - CI/CD con GitHub Actions (opcional)

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

**Nota:** Este roadmap es dinámico. Las tareas se marcarán como completadas conforme avance el desarrollo.
