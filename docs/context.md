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
- Tests: Vitest (strict TDD), `npx vitest run` — 341 tests
- Sin `site` seteado en astro.config.mjs aún (pendiente del cambio SEO)

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

## SEO — en progreso (2026-08-14)

**Change SDD `seo-complete-review` en curso** (proposal + 4 specs + design aprobados; falta tasks/apply/verify/archive).

Gaps identificados:
- Sin schema.org JSON-LD (Person/ProfessionalService en todas las páginas + FAQPage solo en home desde `t('funnel.faq')`)
- Sin hreflang en `<head>` (solo en LanguageSwitcher UI)
- Sin `og:site_name` / `twitter:site`
- Sitemap incompleto: falta `/services` y `/automation` + sin hreflang alternates
- `site` no seteado en astro.config.mjs (dominio hardcodeado en BaseLayout + sitemap)
- Copy `seo.*` por revisar con foco en intención de búsqueda

Ya resuelto:
- **og-image creadas**: `public/og-image-es.jpg` + `public/og-image-en.jpg` (1200x630, ~45KB, per-locale). Prompt en `docs/og-image-prompt.md`. Backups originales en `/tmp/opencode/og-backup/`.

Artefactos del cambio: `openspec/changes/seo-complete-review/` (proposal.md, design.md, specs/{seo-jsonld,seo-head-meta,seo-sitemap,seo-copy-intent}/spec.md) + Engram topic `sdd/seo-complete-review/*`.
