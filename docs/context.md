# Project Context

Particularidades del proyecto que los agentes deben conocer.

## Animación de botones CTA (`plan-cta`)

Todos los botones CTA del funnel usan el componente reutilizable `<CtaButton>` (`src/components/ui/CtaButton.astro`).
**No crear nuevos `<a>` con `plan-cta` manualmente — usar siempre el componente.**

El efecto hover se implementa con pseudo-elementos `::before` y `::after` en `global.css`:

- `::after` — capa base que hereda el `background-color` del botón.
- `::before` — barra que se expande de izquierda a derecha (`width: 0% → 100%`) con `var(--color-accent-hover)`.

**Variantes del componente:** `dark` (default), `light`, `primary`, `accent`.
Layout personalizable vía prop `class`.

**Regla**: No remover las reglas `plan-cta` de `global.css` sin antes consultar.

## Encabezados y jerarquía (2026-08-14)

**Usar siempre el componente `<SectionHeading>` (`src/components/ui/SectionHeading.astro`)** para h2/h3 de sección — no escribir `<h2 class=...>` suelto.

- `variant="section"` → h2 grande (estilo funnel, 30px desktop).
- `variant="category"` → h3 pequeño, con `underline` opcional (animación de subrayado).
- Prop `as` — override del tag semántico independiente del estilo. **Regla WCAG 1.3.1:** un heading que es el PRIMER nivel bajo el h1 de una página debe ser h2 aunque el estilo sea de categoría (usar `variant="category" as="h2"`). Ejemplos: /services, /skills, /contact.
- Los h1 de página usan la escala `text-h1 md:text-h1-md lg:text-h1-lg`.

**Escala tipográfica unificada** (tokens en `tailwind.config.js`):

| Nivel | Móvil | Tablet | Desktop |
|-------|-------|--------|---------|
| h1 | 30px | 35px | 38px |
| h2 | 25px | 25px | 30px |
| h3 | 20px | 20px | 24px |
| h4 | 16px | 16px | 18px |

Tokens: `text-h1/h1-md/h1-lg`, `text-h2/h2-lg`, `text-h3/h3-lg`, `text-h4/h4-lg`.
**Nota:** al agregar clases tipográficas nuevas, reiniciar el dev server (el HMR de Tailwind no siempre regenera el CSS).

## Stack

- Astro 5.18 (output: server, @astrojs/vercel adapter)
- Tailwind CSS 3 + tokens en `tailwind.config.js`
- i18n con rutas `/[locale]/...` (es default, en) — `prefixDefaultLocale: true`
- Tests: Vitest (strict TDD), `npx vitest run` — 341 tests base; suites SEO por rama: 362 (PR1), 357 (PR2), 354 (PR3)
- `site: 'https://coltmandev.dev'` seteado en astro.config.mjs (SEO, mergeado a dev 2026-08-16)

## Estrategia del sitio (2026-08-12)

**Decisión: el sitio funciona como un embudo de venta (funnel).**

La home es una landing AIDA de 12 secciones orientada a conversión (auditoría + WhatsApp). Las páginas interiores deben **reencuadrarse como evidencia de venta**, no como portfolio personal:

| Página | Rol en el embudo |
|--------|------------------|
| Home | Embudo AIDA: problema → solución → CTA auditoría |
| /services | Oferta (planes con precios) |
| /experience | Evidencia: resultados entregados (no trayectoria CV) |
| /projects | Casos de clientes (no portafolio) |
| /about | Confianza: "tu socio técnico" (hub: intro + resultados + stack) |
| /contact | Cierre |
| /automation | Oferta IA: demo interactiva (ChatbotMock) + servicios IA |

**Nav (2026-08-14):** reducido a 4 items por estrategia de funnel — Inicio · Sobre mí · Servicios · Contacto. Las demás páginas (skills, experience, projects) se alcanzan desde CTAs de la home/about. `/automation` se enlaza desde home + /services, NO está en el nav (deliberado).

**About (2026-08-14):** página de confianza con 3 secciones independientes: intro (imagen+h1+descripción), "Resultados recientes" (6 jobs en grid 1/2/3 con CTA → /experience), "Stack y capacidad" (6 skills con acordeón + CTA → /skills).

**Pendiente (varado, no implementado):** sección de Blog / Guías evergreen para tráfico orgánico (SEO topo del embudo). Recomendación anotada: guías cortas evergreen ("Cómo mejorar conversión de tu landing", "Automatiza WhatsApp con n8n") en vez de blog personal; alimentar CTA de auditoría al final de cada guía. **NO implementar hasta definir la estrategia completa** (i18n es/en duplica costo; requiere constancia de publicación).

**Pendiente:** reencuadrar H1s y copy de /experience, /projects, /about, /contact para alinearlos al embudo (hoy hablan de "trayectoria/portafolio").

## Fase 5: AI Automation (2026-08-14) — COMPLETADA

- Página `/automation` con `ChatbotMock` (demo interactiva SIN conexión a modelo — UI-only, vanilla JS).
- `ChatbotMock.astro` (`src/components/ui/`): ventana estilo terminal `➜ juan@dev: ~/chatbot-demo`, quick replies, typing indicator, CTA revelado. Cero network requests.
- `AutomationSection.astro`: intro + beneficios + mock + 4 stats + 4 servicios + CTA WhatsApp.
- **No se inventan proyectos IA** (5.1/5.2 descartados — YAGNI). StatsGrid inline (no componente separado).
- i18n es/en: `automation.*` + `seo.pages/descriptions/h1.automation`.

## SEO — COMPLETADO y ARCHIVADO (2026-08-18)

**Change SDD `seo-complete-review`:** proposal + 4 specs + design + tasks aprobados. **21/21 tareas implementadas** (strict TDD) en 3 PRs stacked-to-dev, **mergeados a dev el 2026-08-16**. **Verify PASS WITH WARNINGS (2026-08-18)**: 391/391 tests, build exit 0, 19/19 req, 37/37 escenarios, 100% cobertura archivos cambiados. **Archivado (2026-08-18)**: 4 specs sincronizadas a `openspec/specs/` + cambio movido a `openspec/changes/archive/2026-08-18-seo-complete-review/`.

**Decisiones de entrega:** forecast 800–900 líneas > budget 400 → chained PRs `stacked-to-dev` (cada PR mergea a dev en orden). PR 1 jsonld+head-meta, PR 2 sitemap, PR 3 copy.

PRs (mergeados):
- [#1](https://github.com/juanvs23/astro-portfolio/pull/1) `feat/seo-jsonld-head-meta` — JSON-LD + head meta (merge commit `c09a4a3`)
- [#2](https://github.com/juanvs23/astro-portfolio/pull/2) `feat/seo-sitemap` — sitemap xhtml alternates (merge commit `69bbd42`)
- [#3](https://github.com/juanvs23/astro-portfolio/pull/3) `feat/seo-copy` — copy SEO + i18n guards (merge commit `0ed6982`; requirió resolver conflicto en messages es/en, resuelto tomando copy de PR3)

Resuelto dentro del cambio:
- **JSON-LD**: Person + ProfessionalService en todas las páginas (`JsonLd.astro` + `src/constants/site-info.ts` single source of truth) + FAQPage home-only desde `t('funnel.faq')`
- **Head meta**: hreflang es/en en `<head>`, og:site_name, twitter:site (@juanvs23), og:image per-locale + og:image:alt (`seo.ogImageAlt` es/en)
- **`site` config**: `site: 'https://coltmandev.dev'` en astro.config.mjs; canonical/og:url vía `Astro.site` (fallback `new URL('https://coltmandev.dev')` si undefined)
- **Sitemap**: `src/lib/seo/sitemap.ts` (16 entries es/en, xhtml hreflang alternates) + endpoint `({ site })`
- **Copy SEO**: `seo.*` es/en por intención (services→precios, automation→IA, projects→casos, about→E-E-A-T, contact→conversión); guards i18n anti-voseo y anti-métricas inventadas (numeric claims ⊆ números reales)
- **og-image creadas**: `public/og-image-es.jpg` + `public/og-image-en.jpg` (1200x630). Prompt en `docs/og-image-prompt.md`

Pendiente del cambio: COMPLETADO — verify (2026-08-18) y archive (2026-08-18) ejecutados. Warnings no bloqueantes: W-1 apply-progress en formato resumido (evidencia de repo sustituye), W-2 deprecación `baseUrl` TS5101 preexistente en tsconfig.json (ajena al cambio SEO).

## GTM / Analytics (gtm-integration, 2026-08-18)

- **Inyección env-gated**: `GtmHead.astro` (loader en `<head>` tras `<ViewTransitions />`) + `GtmBody.astro` (noscript iframe tras `<body>`) en `BaseLayout`. Solo renderizan si `PUBLIC_GTM_CONTAINER_ID` es no vacío — **nunca hardcodear un container id**. Documentada en `.env.example` (vacía por defecto; prod sin GTM hasta setearla en Vercel).
- **Helpers puros**: `src/lib/gtm.ts` — `shouldLoadGtm(containerId?)`, `buildDataLayerEvent(name, payload?)`, `pushDataLayer(event)` (wrapper DOM que guarda `window.dataLayer`). Patrón espejo de `motion-guard.ts` (contrato puro + wrapper DOM). RED-first en `src/lib/gtm.test.ts` (node, sin DOM).
- **Client**: `src/lib/gtm-client.ts` (script bundleado en BaseLayout, llama `initGtmClient()`). Guarda doble-init, y con env vacío NO registra listeners ni expone `window.__gtmPush`. Expone `window.__gtmPush(name, payload?)` para handlers `is:inline`.
- **Eventos (snake_case)**:
  - `pageview` — en cada `astro:page-load` (carga inicial + soft navs), `page: pathname`. Desactivar auto-pageview en el dashboard GTM para no duplicar la primera carga.
  - `whatsapp_cta` — listener delegado en `document` sobre `a[href*="wa.me"]` (fase burbuja). Excluye `[data-wa-number]` (LeadForm; su handler hace `stopPropagation()` de todos modos).
  - `plan_whatsapp_cta` con `plan` — links con `data-gtm-plan` (solo los 3 planes web de ServicesSection).
  - `contact_whatsapp_cta` (`source='contact'`) y `audit_cta` (`source='audit'`) — push dentro del handler de LeadForm.
- **ADR — plan id estable no localizado**: `services.webPlans[].id` = `basic|professional|ecommerce` en `messages/es.json`+`en.json` (mismo valor en ambos locales). Es la clave de tracking para `plan_whatsapp_cta`; `name` sigue localizado solo para display. Los tags/triggers de GTM deben matchear el `id`, no el `name`.
- **Verificación**: `npx vitest run` (402 tests), `npm run build` exit 0. Con env vacío: **0** ocurrencias de `googletagmanager` en el HTML renderizado. Con env seteado: loader en head + noscript iframe + client activo. Client bundleado se inlina en el HTML (`dataLayer` como identificador inerte cuando env vacío — no crea el array).
- **Pendiente (follow-ups)**: consent mode (GDPR/CCPA), CSP allowlist (`googletagmanager.com`, `google-analytics.com`), tags/triggers en el dashboard GTM.
