# Roadmap — WordPress Headless (fuente de verdad compartida)

> **Decisión (29 Sep 2026):** el CMS a medida (`backoffice-cms`) queda abandonado — mantener auth + API + panel + Mongo para 18 proyectos y un blog es infraestructura desproporcionada.
> Nueva arquitectura: **WordPress headless (ya instalado en el servidor coltmandev.dev)** como fuente de verdad única de proyectos y blog, consumida en build por **astro-portfolio** y **astro-sales** vía WP REST API.
> Rama de trabajo: `feature/wordpress-headless` (nace de `main` + trabajo frontend recuperado). Histórico del CMS: tag `archive/backoffice-cms-experiment` (18 commits, sin merge, sin borrar).

## Arquitectura objetivo

```
coltmandev.dev (servidor propio)
└── WordPress headless (admin blindado, sin tema público)
    ├── CPT `project`: desc_es, desc_en, tech, url, image, show_on, order, visible
    ├── Posts (blog — futuro)
    └── REST: /wp-json/coltman/v1/projects · /wp-json/wp/v2/posts

astro-portfolio ──fetch en build──► WP API ◄──fetch en build── astro-sales
        │                                                            │
        └──── fallback: snapshot JSON versionado en cada repo ────────┘
        └──── webhook save_post → Deploy Hooks de Vercel (ambos) ─────┘
```

**Principios**
- Ambos sitios siguen siendo **HTML estático prerenderizado**; ningún visitante toca WordPress.
- Lectura pública REST sin credenciales en build; admin blindado.
- **Fallback snapshot versionado** en cada repo: si WP cae, el build degrada con warning, nunca se rompe; los sitios publicados no se caen.
- Sin Mongo, sin auth propio, sin panel SPA: ~100 líneas de PHP en mu-plugins, cero código de servidor que mantener.

## Fases

### Fase 0 — Cierre del CMS a medida
- [x] Tag de archivo `archive/backoffice-cms-experiment` sobre `feature/backoffice-cms` (18 commits, sin merge)
- [x] Recuperado el trabajo frontend de la rama archivada a `feature/wordpress-headless` en commit propio (`89a453d`): i18n quick wins + español neutro, refactor de servicios, AdditionalServicesSection, whatsapp env var, fixes Motion One / View Transitions / SVG, eliminados `quote-calculator.ts` y `Welcome.astro` — verificado: **373 tests verdes, astro check 0 errores**
- [x] Este roadmap (reemplaza el plan backoffice-cms)
- [x] Abandono del cambio SDD `backoffice-cms` registrado en memoria (docs en `openspec/changes/backoffice-cms/` quedan en disco como registro histórico)
- [ ] Actualizar `context.md` (§14/§15) — quitar referencias al CMS a medida, documentar la decisión WP headless
- [ ] WIP del editor sin commit (stash `user WIP edits services pages`): puro re-formato (comillas/re-wrap) en PricingBofu/ServicesSection/services.astro — decidir si se aplica o se descarta
- [ ] Residuo local del CMS: `cms/` (466M — puede contener `.env` con secretos) y `packages/` (204K build artifacts) — borrado pendiente de decisión del usuario

### Fase 1 — WordPress: adaptar el install existente (servidor)
> El WP ya está instalado: primero inventario del estado real, luego adaptación. Nunca tocar a ciegas.

- [ ] 1.1 **Inventario**: URL pública y admin, versión WP/PHP, plugins activos, `GET /wp-json/` responde, permalinks
- [ ] 1.2 **CPT `project`** con `show_in_rest` + meta: `desc_es`, `desc_en`, `url`, `tech`, `image`, `show_on` (portfolio|sales|both), `order`, `visible` — mu-plugin (~100 líneas PHP)
- [ ] 1.3 **Endpoint limpio** `/wp-json/coltman/v1/projects`: payload bilingüe + media (`_embed`), validado con curl
- [ ] 1.4 **Seed de los 18 proyectos** desde los arrays inline de `ProjectsSection.astro` (migración única de datos)
- [ ] 1.5 **Blindaje**: admin protegido (subdominio + fail2ban), 2FA, XML-RPC off, editor de archivos off, auto-updates menores, backups servidor + BD
- **Salida**: `curl .../wp-json/coltman/v1/projects` devuelve los 18 proyectos bilingües; admin protegido; backup operativo.

### Fase 2 — astro-portfolio consume la API (TDD estricto)
> Antes del primer commit de código: crear `odd/tasks/wordpress-headless.md` (protocolo ODD) con la checklist de esta fase.

- [ ] 2.1 **Capa de datos** `src/lib/content/`: fetch en build + validación Zod + **fallback a snapshot** `src/data/snapshot/projects.json` con warning audible
- [ ] 2.2 **Migrar secciones**: `ProjectsSection`/`ProjectsPreviewSection` eliminan los arrays inline (42 descripciones hardcodeadas — deuda i18n) y consumen la capa
- [ ] 2.3 **Imágenes remotas**: `image.domains`/remote patterns del dominio WP (imageService Vercel)
- [ ] 2.4 **Tests** (vitest): esquema Zod · fetch OK · fetch falla → snapshot · snapshot ausente → error loud
- [ ] 2.5 **SEO**: `seo-jsonld`/`seo-head-meta` siguen con fallback a constantes (siteInfo NO migra a WP por ahora)
- **Salida**: `vitest run` verde · `astro check` sin errores nuevos · build local renderiza los 18 proyectos desde WP.

### Fase 3 — astro-sales consume la API
- [ ] 3.1 Misma capa de datos en su repo, filtrando `show_on` = sales|both
- [ ] 3.2 Su `ProjectsSection`/`ProjectItem` consumen la capa; tests propios
- **Salida**: build de astro-sales renderiza proyectos desde WP.

### Fase 4 — Propagación de contenido
- [ ] 4.1 Webhook `save_post` (mu-plugin) → Deploy Hooks de Vercel de ambos proyectos
- [ ] 4.2 Estrategia de snapshot: regenerar en builds exitosos o actualizar al cambiar contenido
- **Salida**: publicar en WP reconstruye ambos sitios solo.

### Fase 5 — Blog (aplazado hasta que toque)
- [ ] Posts WP → páginas estáticas (`getStaticPaths`) en el/los sitios que toque
- [ ] i18n de posts: campos meta es/en (simple) o Polylang (si se necesita traducción completa)

## Notas
- Entrega por fases: PR normal a `main` por repo (sin `size:exception`); Fase 2 es la mayor y no se acerca a 400 líneas.
- Strict TDD (vitest) para todo código de repos; lado PHP se valida con curl/integración.
- Pendiente heredado del frontend: precios visibles del home y catálogo formal de servicios adicionales.

---

## Histórico — backoffice-cms (archivado, Sep 2026)
CMS headless a medida 4/5 slices: `packages/contracts` (Zod, 39 tests) · `cms/server` (Hono+Mongo, auth JWT, 116 tests) · content-api (CRUD+seed+upload) · `cms/admin` (React SPA, 32 tests) · services-content. Abandonado antes de integrar el portfolio. Registro: tag `archive/backoffice-cms-experiment`, docs `openspec/changes/backoffice-cms/`, topics `sdd/backoffice-cms/*` en memoria.

## Histórico — Frontend Servicios y Planes (9 Sep 2026) ✅
> Reestructuración de la oferta comercial. Detalle en `context.md` §15.
- [x] `ServicesSection.astro` 598→~77 líneas (fuera planes/cotizador IA) · `/services`: Planes → Adicionales → Servicios · precios ocultos del home
- [x] `AdditionalServicesSection.astro` nuevo (4 servicios, CTA WhatsApp) · fix leaks View Transitions · fix SVG paths · fix Motion One · fix 504 dev
- [x] i18n: AdditionalServices (17) + quick wins (Services 5, LeadForm 6, Automation 1, Chatbot 1, BaseLayout 2 SEO) · español neutro
- [x] WhatsApp → env var `PUBLIC_WHATSAPP_NUMBER` (`src/lib/whatsapp.ts`) · eliminados `quote-calculator.ts` y `Welcome.astro`
