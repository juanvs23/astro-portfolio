# Roadmap — Backoffice CMS (`backoffice-cms`)

> Cambio SDD: **backoffice-cms** — CMS headless a medida (API pública + panel admin) para el portfolio.
> Entrega: **single-pr** en rama `feature/backoffice-cms` · Contabilidad de intentos desactivada (`--scope clone`).
> Fecha: Sep 2026 · Ver `context.md` §14 y `openspec/changes/backoffice-cms/*` para detalle.

## Progreso

| # | Slice | Estado | Tests | Commit(s) en `feature/backoffice-cms` |
|---|---|---|---|---|
| 0 | Workspace pnpm + `packages/contracts` (Zod) | ✅ | 39 | `6042939`, `2cdd455` |
| 1 | `cms/server`: Hono + auth (JWT access/refresh + rotación, rate-limit, roles) | ✅ | 116 | `451698a`→`e239faa` |
| 2 | content-api: GET públicos + aggregate + CRUD admin + upload Blob + seed | ✅ | (incl. en 116) | `f25f017`→`f854799` |
| 3 | `cms/admin` SPA React: login, guards, CRUD bilingüe, upload, users | ✅ | 32 admin | `d1809e3`, `74e8615`, `46187e4` |
| 3b | **services-content**: modelo, contrato, endpoint `/api/v1/services`, CRUD admin, seed (planes, adicionales, express) | ⬜ | — | — |
| 4 | **Integración portfolio**: consumir API on-demand + caché TTL + fallback, prerender→on-demand, imágenes | ⬜ | — | — |
| 5 | PR único a `main` + deploy Vercel + `sdd-verify` + `sdd-archive` | ⬜ | — | — |

## Pendiente — Slice 5 (integración del portfolio)

- [ ] Capa de datos en el portfolio: fetch a la API con caché TTL y **fallback a `src/constants/*`**
- [ ] Páginas que leen contenido: pasar de `prerender=true` a render on-demand (sin romper)
- [ ] Manejo de imágenes: `image.domains`/remote patterns para Vercel imageService; map estático para las 18 legacy (`src/lib/cms/image.ts`)
- [ ] `seo-jsonld` / `seo-head-meta`: consumir siteInfo de la API con fallback
- [ ] Tests de la integración (caché/fallback) — Strict TDD

## Pendiente — Entrega (post-Slice 5)

- [ ] Buildear `@cms/contracts` `dist/` antes del deploy del server (o prebuild)
- [ ] Config `CORS_ORIGINS` del server incluir el origin del panel admin
- [ ] Config `VITE_API_URL` en `cms/admin`
- [ ] Deploy Vercel: `cms/server` (serverless) + `cms/admin` (estático) como proyectos separados
- [ ] `sdd-verify` (valida contra specs) y `sdd-archive` (cierra el cambio)

## Notas

- El forecast de `sdd-tasks` subestimó 3x las líneas reales (slice 2: 4.467 vs 1.600 forecast) → se desactivó la contabilidad de intentos por decisión del usuario.
- Los docs/specs SDD viven en `openspec/changes/backoffice-cms/` (gitignored) y en Engram (topics `sdd/backoffice-cms/*`).
- Estrategia de entrega: **single-pr** (decisión del usuario). La rama `feature/backoffice-cms` nace limpia de `main`, solo con commits de código.

---

## Frontend — Servicios y Planes (9 Sep 2026) ✅

> Fuera del scope CMS: reestructuración de la oferta comercial del portfolio. Detalle completo en `context.md` §15.

### Completado
- [x] `ServicesSection.astro`: 598→~77 líneas — eliminados zona de planes y cotizador IA (solo custom work, express, proceso)
- [x] `AdditionalServicesSection.astro` (nuevo): 4 servicios adicionales con CTA WhatsApp — colocado **justo debajo de los planes** en `/services`
- [x] Página `/services`: **Planes primero** (`PricingBofuSection`) → Servicios Adicionales → Servicios
- [x] Precios eliminados del home: `PricingBofuSection` sin precios visibles, WhatsApp genérico
- [x] Fix leaks View Transitions en `BaseLayout.astro` (AOS, underline, typewriter)
- [x] Fix SVG paths rotos (`LeadForm`, `FaqSection`, `HeroSection`)
- [x] Eliminado `quote-calculator.ts` + test (código muerto)
- [x] Fix 504 dev (cache Vite `node_modules/.vite`)
- [x] 375 tests vitest pasan · `astro check` sin errores nuevos

### Pendiente / ideas
- [x] Traducir la sección de servicios adicionales (`AdditionalServicesSection.astro`): textos movidos a `messages/{es,en}.json` (`services.additional.heading` + `cards[4]{title,description,cta,whatsappMessage}`) — 10 Sep 2026
- [x] Quick wins i18n (10 Sep 2026): ServicesSection (5), LeadForm (6, define:vars), AutomationSection (1, buildWhatsAppLink), ChatbotMock (1 aria-label), BaseLayout (2 SEO sentinels) + typo fix "Cuentamos" → "Contanos" (voseo) → **español neutro**: "Cuéntanos"/"Cuéntame"/"Aprovecha"/"Usa"/"Necesitas"
- [ ] `ProjectsSection`/`ProjectsPreviewSection` (36+6 descripciones inline) → evaluar junto al Slice 5 del CMS (datos migrarán a la API). `Welcome.astro` = leftover del starter sin importadores → eliminar
- [ ] Decidir si los planes del home deben llevar precios visibles de vuelta (hoy ocultos por decisión del usuario)
- [ ] Definir catálogo formal de servicios adicionales con precios para el flujo de cotización