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
- Constantes con datos: 7 trabajos, 21 proyectos, redes sociales, formulario
- Assets en `public/`: imágenes, banderas, videos, favicons
- `context.md` con documentación completa del proyecto
- `DESIGN.md` con guía de diseño (Berkeley Mono, paleta cremosa, ASCII markers)
- **Fase 0 completada** (Setup y Configuración)
  - Tailwind CSS v3 configurado con tokens de DESIGN.md
  - Three.js + @types/three instalados
  - Nodemailer instalado
  - i18n utilities creadas (`src/i18n/`)
  - Middleware para detección de locale
  - Rutas multilingües configuradas (`/es`, `/en`)
  - Alias `@/*` configurado
- **Fase 1 completada** (Layout y Componentes Base)
  - `BaseLayout.astro` con SEO, OG tags, i18n
  - Componentes UI: Button, Input, Textarea, Badge, Section, AsciiMarker
  - Componentes layout: Header, Footer, LanguageSwitcher, MobileMenu
  - `Layout.astro` actualizado como wrapper completo
- **Fase 2 completada** (Secciones del Portafolio)
  - `HeroSection.astro` con Three.js (icosaedro wireframe + partículas + anillo)
  - `AboutSection.astro` con imagen, descripción y skills
  - `SkillsSection.astro` con 6 categorías (Frontend, Backend, CMS, DevOps, APIs, DB)
  - `ExperienceSection.astro` con timeline de 7 trabajos
  - `ProjectsSection.astro` con grid de 18 proyectos
  - `ContactSection.astro` con formulario + redes sociales
  - Rutas multilingües: `/es/`, `/en/`

### ❌ Pendiente
- **Modo oscuro** — toggle dark/light con persistencia en localStorage, tokens de color invertidos
- API route para formulario de contacto (Fase 3)
- Optimización de imágenes y Three.js (Fase 3)
- SEO avanzado: sitemap, robots.txt (Fase 3)
- Testing y despliegue (Fase 4)

---

## 🎯 Fase 0: Setup y Configuración

**Objetivo:** Instalar dependencias y configurar el entorno base.

### Tareas

- [x] **0.1 Instalar dependencias principales**
  ```bash
  npm install @astrojs/tailwind tailwindcss@3 three @types/three nodemailer @tailwindcss/postcss
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

- [ ] **0.5 Limpiar código heredado de Next.js** *(pendiente - se usará luego)*

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

- [x] **2.1 Sección Hero + Three.js Selector (`src/components/sections/`)**
  - `HeroSection.astro` — Three.js inline con icosaedro wireframe + partículas + anillo
  - Escena 3D interactiva con mouse tracking
  - Click en mesh redirige a secciones
  - Fondo dark surface (#201d1d) como DESIGN.md

- [x] **2.2 Sección Quién Soy (`src/components/sections/AboutSection.astro`)**
  - Imagen: `public/img/aboutme.jpg`
  - Título bilingüe desde `messages/*.json`
  - Descripción bilingüe desde `messages/*.json`
  - Lista de skills con ASCII markers `[+]`
  - Layout: grid 320px + texto en desktop, apilado en mobile

- [x] **2.3 Sección Skills (`src/components/sections/SkillsSection.astro`)**
  - 6 categorías: Frontend, Backend, CMS, DevOps, APIs, DB
  - Grid 1-2-3 columnas responsive
  - Estilo: hairline-bordered cards con ASCII markers

- [x] **2.4 Sección Empresas (`src/components/sections/ExperienceSection.astro`)**
  - Timeline de 7 trabajos con fechas formateadas
  - Datos desde `messages/*.json` vía `getTranslations()`
  - Estilo: hairline-bordered rows con ASCII markers `[+]`/`[x]`

- [x] **2.5 Sección Proyectos (`src/components/sections/ProjectsSection.astro`)**
  - Grid de 18 proyectos con imagen, nombre, URL
  - Cards con hover effect y border transition
  - Imágenes desde `public/img/` con lazy loading

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

- [ ] **3.1 API Route para contacto (`src/pages/api/contact.ts`)**
  - Endpoint POST para enviar emails con Nodemailer
  - Validación de datos en servidor
  - Respuesta JSON con estado (success/error)
  - Variables de entorno para credenciales de email

- [ ] **3.2 Optimización de imágenes**
  - Usar `<Image />` de Astro para imágenes en `src/assets/`
  - Imágenes en `public/` sirven directamente (favicons, logos externos)
  - Lazy loading para imágenes de proyectos

- [ ] **3.3 Three.js optimización**
  - Carga diferida (`client:visible` o `client:load`)
  - Reducir polígonos y texturas para mobile
  - Fallback estático si WebGL no está disponible

- [ ] **3.4 SEO y Meta Tags**
  - Datos SEO desde `messages/*.json` (`seo.title`, `seo.description`)
  - Open Graph tags por página
  - Sitemap XML
  - Robots.txt

- [ ] **3.5 Accesibilidad**
  - ARIA labels en componentes interactivos
  - Navegación por teclado
  - Contraste de colores según DESIGN.md
  - Lang attribute dinámico

- [ ] **3.6 Modo Oscuro**
  - Toggle dark/light en Header
  - Persistencia en `localStorage` + detección `prefers-color-scheme`
  - Tokens invertidos: canvas ↔ surface-dark, ink ↔ on-dark
  - Three.js background adaptativo
  - Transición suave entre modos

---

## 🚀 Fase 4: Testing y Lanzamiento

**Objetivo:** Validar, optimizar y desplegar en producción.

### Tareas

- [ ] **4.1 Testing manual**
  - Navegación entre secciones (desktop, tablet, mobile)
  - Selector Three.js funcional en todos los navegadores
  - Formulario de contacto envía emails correctamente
  - Language switcher cambia contenido ES ↔ EN
  - Links externos abren correctamente

- [ ] **4.2 Performance**
  - `npm run build` — verificar output size
  - Lighthouse: Performance > 90, Accessibility > 90, SEO > 90
  - Optimizar carga de Three.js (code splitting, lazy load)
  - Minificar CSS y JS

- [ ] **4.3 Validación de i18n**
  - Todas las traducciones ES/EN completas
  - URLs con prefijo de locale (`/es/about`, `/en/about`)
  - Fallback a ES si falta traducción EN

- [ ] **4.4 Despliegue**
  - Configurar adapter de Astro (`@astrojs/vercel`, `@astrojs/netlify`, o `@astrojs/node`)
  - Variables de entorno en plataforma de despliegue
  - Dominio custom configurado
  - CI/CD con GitHub Actions (opcional)

---

## 📁 Estructura Final Esperada

```
src/
├── assets/              # Imágenes importadas (optimizadas por Astro)
├── components/
│   ├── ui/              # Button, Input, Textarea, Badge, Section, AsciiMarker
│   ├── layout/          # Header, Footer, LanguageSwitcher, MobileMenu
│   └── sections/        # ThreeSelector, AboutSection, SkillsSection,
│                        # ExperienceSection, ProjectsSection, ContactSection
├── constants/           # Datos estáticos (refactorizado sin next-intl)
├── i18n/                # Utilidades de internacionalización
├── layouts/             # BaseLayout.astro
├── pages/
│   ├── index.astro      # Homepage con Three.js selector
│   ├── [locale]/        # Rutas multilingües
│   │   ├── index.astro
│   │   └── ...
│   └── api/
│       └── contact.ts   # Endpoint para formulario
├── types/               # Interfaces TypeScript
└── styles/              # Global styles, Tailwind imports

public/
├── img/                 # Imágenes de proyectos y assets
├── flags/               # Banderas para language switcher
├── shiba/               # Assets Shiba
├── videos/              # Videos (numbers.mp4)
├── favicon.ico
└── favicon.svg
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
