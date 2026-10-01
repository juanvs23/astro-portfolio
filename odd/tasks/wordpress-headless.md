# Feature: wordpress-headless — astro-portfolio consumes the WP API

**Repo file:** `odd/tasks/wordpress-headless.md` · **Mirror:** engram `odd/wordpress-headless/tasks`
**Branch:** `feature/wordpress-headless` · **Created:** 2026-09-30 · **Status:** in progress

## Objective

Phase 2 of `ROADMAP.md`: astro-portfolio renders its projects from the WordPress headless API (build-time fetch + Zod validation + snapshot fallback), removing the 42 hardcoded es/en descriptions from `ProjectsSection` / `ProjectsPreviewSection`.

## Problem / Why

The content of 18 projects lives duplicated inline in 2 components (42 hardcoded es/en descriptions — the tracked i18n debt). The single source of truth is now the WP at `https://projects.coltmandev.dev/porfolio` (CPT `projects`, public REST verified live 2026-09-30, seeded and end-to-end tested).

## Contract (verified live 2026-09-30)

- `GET https://projects.coltmandev.dev/porfolio/wp-json/wp/v2/portafolio?_embed&orderby=menu_order&order=asc&per_page=100`
- 18 items. Each: `slug`, `title.rendered`, `menu_order` (1–18), `meta.{desc_es, desc_en, url, tech, show_on, featured, visible}` (checkbox values are the strings `'on'`/`''`), `_embedded['wp:featuredmedia'][0].{source_url, media_details.{width,height}, alt_text}`.
- WP core adds an extra `meta.footnotes` key — the schema must tolerate extra keys (zod default strips them; do not use `.strict()`).
- `featured='on'` exactly on: `gericht`, `steps-together`, `instituto-mia`.
- Fixture with a real item: `/tmp/opencode/fixture-gericht.json`. Full live payload: `/tmp/opencode/wp-projects-live.json`.

## Scope (authorized — "procede con todos los puntos sin preguntarme")

- `src/lib/content/` (schema + data layer + tests)
- `src/data/snapshot/projects.json` (fallback, generated from the live API)
- `src/components/sections/ProjectsSection.astro`, `ProjectsPreviewSection.astro`; `ProjectItem` type updates; `astro.config.mjs` (image remotePatterns); `.env.example` (`PUBLIC_WP_API_URL`)
- Out of scope: SEO (seo-jsonld / seo-head-meta keep constants), `messages/*.json`, other sections, `cms/` + `packages/` residue (Phase 0 decision still pending)

## Constraints

- Strict TDD (vitest): RED observed before GREEN; never fake evidence. Runner: `npm run test:run`. Baseline: **373 passed** (2026-09-30).
- UI copy stays in `messages/{es,en}.json` (untouched); code/comments/identifiers in English.
- House pattern: `src/lib/*.ts` with colocated `*.test.ts`; alias `@ → src` (available in vitest via `getViteConfig`).
- Remote `<Image>` requires explicit `width`/`height` in Astro 5 — take them from `media_details` (verified: 1920×2246).
- No secrets in repo; `PUBLIC_WP_API_URL` with fallback constant (pattern of `src/lib/whatsapp.ts`).
- `npm i zod` needed (not currently a dependency).

## Checklist (one work-unit commit per task)

- [x] T1 `zod` dep + `src/lib/content/schema.ts` + `schema.test.ts` — WP payload schema → domain `Project`; `'on'→true` coercion; tolerate `footnotes`; reject malformed — zod@4.6.5 (a335224) + schema (86a2b4b); RED: 1 failed (unresolved `./schema`) → GREEN: 7 passed; real 18-item live payload parses, `footnotes` stripped
- [x] T2 `src/lib/content/projects.ts` + `projects.test.ts` — fetch→Zod→filter `visible && show_on ∈ (site|both)`, sort by `order`; fetch fail → snapshot + LOUD warning; no snapshot → loud throw; module-level build cache — (2141aa9); RED: 1 failed (unresolved `./projects`) → GREEN: 9 passed (incl. cache: fetch stub called once across 3 calls)
- [x] T3 `src/data/snapshot/projects.json` — generated from the live API (raw payload, verbatim curl output) — (2141aa9); byte-identical copy of the live curl output (87,559 bytes, 18 items); snapshot-integrity test green
- [x] T4 `ProjectsSection` consumes the layer (remove the 18-item array + 18 static imports; `desc` per locale from `p.desc`) — (ad0d38f); −166 lines; `grep -l "Gericht" dist/client/{es,en}/projects/index.html` → both match, localized es/en descriptions from WP
- [x] T5 `ProjectsPreviewSection` consumes the layer (featured 3 by order; first-sentence tab behavior kept) — (7c554bf); built HTML shows tabs `gericht`/`steps-together`/`instituto-mia` with first-sentence labels ("Landing page de restaurante con menú, galería y reservas.")
- [x] T6 `astro.config.mjs` `image.remotePatterns` + `ProjectItem`/types accept remote image URL with width/height — (ad0d38f); `<img … width="1920" height="2246" …>` via `/_vercel/image?url=…projects.coltmandev.dev…` in built HTML
- [x] T7 SEO regression: existing seo tests stay green (no migration — verification only) — focused run: 3 files / 32 tests passed (head-meta, jsonld, sitemap)
- [x] T8 Closure: `npm run test:run` green · `npx astro check` no new errors · `npm run build` renders the 18 from WP · ROADMAP Phase 2 boxes checked · single PR to `main` (<400 lines) — vitest 389 passed (14 files); astro check 0 errors (baseline 0; hints 84→87: zod v4 deprecations surfaced in pre-existing `packages/contracts` dist, no new errors); live build: 18 unique WP images + names per language page, fallback build warns once and still renders; ⚠ authored diff = 857 lines (649+/208−, excl. lockfile+snapshot; 385 are the two test files) — OVER the 400 forecast: slice the 5 code commits into 2–3 chained PRs (T1+T2+T3 data layer · T4+T6+T5 sections · T8 docs) or record `size:exception`

## Acceptance criteria

- `npm run test:run` → all green including the new tests
- `npx astro check` → no new errors vs baseline
- `npm run build` → prerendered HTML of the projects page contains the 18 projects fetched from the live API
- WP unreachable ⇒ build degrades to the snapshot with an audible warning (unit-tested)

## Verification commands

- `npm run test:run`
- `npx astro check`
- `npm run build` (+ grep the built HTML for project names)

## Progress log

- 2026-09-30: doc created. Baseline 373 tests green in 404ms. Contract verified live (18 items, media_details 1920×2246, footnotes key present). Astro docs checked: `remotePatterns: [{ protocol, hostname }]`; remote `<Image>` requires width/height. RDD off. Roadmap Phase 1 marked executed.
- 2026-09-30: Phase 2 executed (T1–T8, strict TDD RED→GREEN per unit). Commits: a335224 (zod dep) · 86a2b4b (schema, 7 tests) · 2141aa9 (data layer + snapshot, 9 tests) · 4cbc6a5 (test stub typing fix) · ad0d38f (ProjectsSection + remote images + remotePatterns) · 7c554bf (ProjectsPreviewSection). Final: vitest 389 passed (14 files); astro check 0 errors/0 warnings (hints 84→87 from zod deprecations in pre-existing `packages/contracts/dist` — outside scope, Phase 0 pending); live build prerenders the 18 projects in both languages from the WP API (`grep -l Gericht` matches `dist/client/{es,en}/projects/index.html`); forced-unreachable build degrades to the snapshot with one loud `[projects]` warning and still renders all pages. Delivery: authored diff 857 lines (excl. lockfile+snapshot) exceeds the 400 forecast — recommend chaining T1–T3 / T4–T6 / T8 as PR slices or recording `size:exception` before the PR to `main`. Follow-up noted: 18 image files in `src/assets/img` are now unreferenced (asset deletion not in scope).

## Delivery strategy

`ask-on-risk` default → forecast well under 400 authored lines → single PR to `main`, no `size:exception`, no chain needed.
