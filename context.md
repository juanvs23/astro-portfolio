# Contexto del Proyecto: Portafolio Multilingüe con Astro

## 1. Descripción General

Este es un portafolio moderno construido con **Astro** que trabaja con **2 idiomas**: español (es) e inglés (en).

El portafolio fue originalmente realizado en **Next.js** con las siguientes tecnologías:
- Tailwind CSS
- Nodemailer
- Swiper
- next-intl
- TypeScript

Se mantiene **TypeScript** como lenguaje obligatorio para todo el código.

## 2. Estilizado con Tailwind CSS

Se utiliza **Tailwind CSS (versión más reciente)**, adaptado de acuerdo al archivo `DESIGN.md` ubicado en la raíz del proyecto.

### Paleta de Colores (DESIGN.md)
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
- **Fuente principal:** Berkeley Mono (con fallback a JetBrains Mono, IBM Plex Mono, Geist Mono)
- Todos los roles de texto usan la misma familia monoespaciada
- Pesos disponibles: 400 (regular), 500 (medium), 700 (bold)

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

### Border Radius
| Token | Valor | Uso |
|---|---|---|
| none | 0px | Secciones, contenedores |
| sm | 4px | Elementos interactivos |
| full | 9999px | Avatar circles |

### Principios de Diseño
- 100% tipografía monoespaciada (Berkeley Mono o sustituto)
- Fondo crema `#fdfcfc` como único background de body
- Sin sombras, sin gradientes, sin imágenes decorativas
- Marcadores ASCII `[+]`, `[-]`, `[x]` como bullets/iconos
- Secciones separadas por reglas hairline de 1px
- Ritmo de sección: 96px entre bloques de contenido
- Solo una superficie dark (`#201d1d`) por página (hero mockup)

## 3. Arquitectura y Componentes Reutilizables

El proyecto debe utilizar **componentes reutilizables** pensando en **código limpio y arquitectura limpia**.

### Estructura de Carpetas
```
src/
├── assets/          # Archivos estáticos importados
├── components/      # Componentes reutilizables (Astro + TypeScript)
│   ├── ui/          # Componentes base (botones, inputs, badges)
│   ├── layout/      # Header, Footer, Nav
│   └── sections/    # Secciones del portafolio
├── constants/       # Datos estáticos y configuraciones
├── layouts/         # Layouts principales
├── pages/           # Páginas de Astro
├── types/           # Interfaces y tipos TypeScript
└── i18n/            # Configuración de internacionalización
```

### Mensajes de Internacionalización
Los archivos de traducción se encuentran en `messages/`:
- `messages/en.json` - Inglés
- `messages/es.json` - Español

### Tipos TypeScript
Definidos en `src/types/index.ts`:
- `ItemView` - Elementos de vista
- `JobItem` - Experiencia laboral
- `JobToolItem` - Herramientas por trabajo
- `InputInterface` - Campos de formulario
- `Status` - Enum de estados (idle, loading, succeeded, failed, error)
- `NetworkItem` - Redes sociales
- `SocialNetWorksInterface` - Sección de redes
- `EmailMe` - Datos de email
- `ContactUsInterface` - Sección de contacto
- `FormInterface` - Estado del formulario
- `ProjectItem` - Proyectos
- `ProjectSectionType` - Sección de proyectos
- `sendMailType` - Configuración de envío de email

### Constantes
Definidas en `src/constants/index.ts`:
- `useSocialNetWorks` - Redes sociales (GitHub, Facebook, LinkedIn, X)
- `UseAbout` - Datos de "Acerca de mí"
- `useJobs` - Experiencia laboral (7 trabajos)
- `useProjects` - Proyectos (21 proyectos)
- `useInitialForm` - Estado inicial del formulario de contacto
- `useContactUs` - Datos de contacto
- `useFormMessage` - Mensajes del formulario
- `useFooter` - Datos del footer

## 4. Frontend y Navegación Three.js

La **frontpage** tendrá un **selector con Three.js** para navegar entre las secciones del proyecto de forma interactiva en 3D.

### Implementación
- Three.js se usará como componente cliente (`client:load` o `client:visible`)
- El selector 3D permitirá transicionar entre las secciones del portafolio
- Las imágenes de referencia están en la carpeta `public/`

## 5. Secciones del Portafolio

El proyecto tendrá las siguientes secciones:

### a. Quién Soy (About Me)
- Presentación personal como Full Stack Developer
- Descripción de experiencia y habilidades
- Imagen: `public/img/aboutme.jpg`

### b. Skills
- Habilidades técnicas organizadas por categoría
- Marcadores ASCII `[+]` para listar tecnologías

### c. Empresas (Work Experience)
- Experiencia laboral con 7 empresas:
  1. Addiction Marketing Agency (2024-8 a 2025-4)
  2. Ciancoders (2024-5 a 2024-8)
  3. TREMGROUP LLC (2022-8 a 2024-4)
  4. Conocimiento Corporativo S.A.S (2021-12 a 2022-6)
  5. Nivelics SAS (2021-6 a 2021-11)
  6. ZtGroup LLC (2020-3 a 2021-6)
  7. Hispano Soluciones CA (2018-3 a 2020-1)

### d. Proyectos
- Galería de 21 proyectos con imagen, nombre, URL y descripción
- Incluye: Gericht, Cesde, Thinkus, Dogtorscat, Boreal Expedition, etc.
- Imágenes en `public/img/`

### e. Contacto
- Formulario de contacto con validación
- Campos: Full Name, Phone, Email, Subject, Message
- Integración con Nodemailer para envío de emails
- Links a redes sociales (GitHub, Facebook, LinkedIn, X)

## 6. Imágenes y Assets

Las imágenes del proyecto están en la carpeta `public/`:

### public/img/
- aboutme.jpg, asipi-mexico.jpg, bajalenx.webp, book-test.jpg, boreal.jpg
- boulton.jpg, cesde-proyectos.jpg, cesde.jpg, clima-app.webp, colegios.jpg
- dogtor.jpg, email-icon.png, empleo.jpg, emprende.jpg, gericht.jpg
- globe.png, hisomo.jpg, incredible-room.jpg, luxlife.jpg, news-app.webp
- pockemon.webp, portfolio.jpg, thinkous.jpg, venecredits.jpg
- icons8-left-94.png, icons8-right-94.png
- screencapture-clima-gray-nine-vercel-app-2025-06-22-10_32_39.jpg

### public/shiba/
- Assets relacionados con Shiba

### public/flags/
- Banderas para selector de idioma

### public/videos/
- numbers.mp4

### Otros
- favicon.ico, favicon.svg
- apply-webdev-img.svg, web-desing-job.svg

## 7. Configuración Actual del Proyecto

### package.json
```json
{
  "name": "major-meteor",
  "type": "module",
  "version": "0.0.1",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^6.3.3"
  }
}
```

### astro.config.mjs
Configuración básica de Astro sin plugins adicionales aún configurados.

### tsconfig.json
Configuración de TypeScript para el proyecto.

## 8. Dependencias a Instalar

Para migrar desde Next.js y cumplir con los requisitos, se necesitarán:

- **@astrojs/tailwind** - Integración de Tailwind CSS con Astro
- **three** + **@types/three** - Three.js para el selector 3D
- **nodemailer** - Envío de emails (formulario de contacto)
- **astro-i18n** o solución custom - Internacionalización (reemplazo de next-intl)
- **swiper** o alternativa - Carrusel/slider si es necesario

## 9. Breakpoints Responsivos

| Nombre | Ancho | Cambios |
|---|---|---|
| desktop-large | 1280px+ | Layout por defecto |
| desktop | 1024px | Nav horizontal |
| tablet | 850px | Footer 2-up, layouts apilados |
| tablet-narrow | 768px | Nav hamburger drawer |
| mobile | 640px | Single-column, display 38px → 28px |

## 10. Notas de Migración desde Next.js

- Reemplazar `next-intl` con solución de i18n para Astro
- Reemplazar componentes React con componentes Astro
- Usar `client:load`, `client:visible`, `client:only` para componentes interactivos (Three.js, formularios)
- Mantener los archivos de traducción en `messages/`
- Adaptar los hooks de React (`useTranslations`) a utilidades compatibles con Astro
- Nodemailer debe usarse en endpoints de Astro (API routes)
