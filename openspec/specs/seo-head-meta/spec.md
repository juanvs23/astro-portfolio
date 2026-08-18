# seo-head-meta Specification

## Purpose

Complete the social/sharing head metadata in BaseLayout: og:site_name, twitter:site, bidirectional hreflang alternates (es/en), per-locale og:image pointing to the verified 1200x630 assets (`og-image-es.jpg` / `og-image-en.jpg`), and a localized og:image:alt from NEW SEO-oriented i18n keys. Fixes the current broken `og-image.jpg` reference and the hardcoded domain by deriving URLs from `Astro.site` (set via `site: 'https://coltmandev.dev'` in astro.config.mjs).

## Requirements

### Requirement: Site domain configured and used for URLs

`astro.config.mjs` MUST set `site: 'https://coltmandev.dev'`. The canonical link and og:url MUST be derived from `Astro.site` (not a hardcoded string), keeping the existing `Astro.url.pathname` (which includes the locale prefix). The broken `https://coltmandev.dev/og-image.jpg` reference MUST be removed.

#### Scenario: Canonical and og:url derive from Astro.site

- GIVEN a page at `/es/services` with `site` configured
- WHEN BaseLayout renders
- THEN canonical href and og:url both equal `https://coltmandev.dev/es/services`

#### Scenario: No reference to the removed og-image.jpg

- GIVEN any page renders
- WHEN the head HTML is inspected
- THEN no attribute references `/og-image.jpg`

### Requirement: og:site_name

The head MUST emit `<meta property="og:site_name">` with the brand name derived from `site-info.ts` (single source of truth), on every page and locale.

#### Scenario: og:site_name present

- GIVEN any page renders through BaseLayout
- WHEN the head is inspected
- THEN an og:site_name meta exists with the site-info brand name

### Requirement: twitter:site

The head MUST emit `<meta name="twitter:site">` with the X/Twitter handle `@juanvs23` (matching the X link in `social-links.ts`).

#### Scenario: twitter:site with handle

- GIVEN any page renders
- WHEN the head is inspected
- THEN `<meta name="twitter:site" content="@juanvs23">` is present

### Requirement: Bidirectional hreflang alternates

The head MUST emit `<link rel="alternate" hreflang="es">` and `<link rel="alternate" hreflang="en">` for the current page's localized equivalents, using `prefixDefaultLocale` URLs built from `getLocalizedPathname` (i.e. both `/es/...` and `/en/...` are prefixed). Each alternate MUST point to the corresponding localized URL, including the current locale itself.

#### Scenario: Both directions on an es page

- GIVEN `/es/services` renders
- WHEN the head is inspected
- THEN a hreflang=es alternate points to `/es/services`
- AND a hreflang=en alternate points to `/en/services`

#### Scenario: Both directions on an en page

- GIVEN `/en/about` renders
- WHEN the head is inspected
- THEN a hreflang=en alternate points to `/en/about`
- AND a hreflang=es alternate points to `/es/about`

#### Scenario: Root URLs are the prefixed locale roots

- GIVEN `/es` (home) renders
- WHEN hreflang links are inspected
- THEN alternates point to `/es` and `/en` (no bare `/`)

### Requirement: Per-locale og:image

The head MUST resolve og:image (and twitter:image) by locale: `es` → `/og-image-es.jpg`, `en` → `/og-image-en.jpg`, expressed as absolute URLs derived from `Astro.site`. Both files exist in `public/` at 1200x630.

#### Scenario: es page uses the es asset

- GIVEN an `es` page renders
- WHEN og:image is inspected
- THEN it equals `https://coltmandev.dev/og-image-es.jpg`
- AND twitter:image equals the same URL

#### Scenario: en page uses the en asset

- GIVEN an `en` page renders
- WHEN og:image is inspected
- THEN it equals `https://coltmandev.dev/og-image-en.jpg`

### Requirement: Localized og:image:alt from new keys

The head MUST emit `<meta property="og:image:alt">` per locale, sourced from NEW SEO-oriented i18n keys (e.g. `seo.ogImageAlt`) describing the image with brand keywords. These keys MUST NOT reuse `seo.descriptions.*` values, MUST exist in both `es.json` and `en.json`, and MUST be non-empty.

#### Scenario: es alt text uses the new es key

- GIVEN an `es` page renders
- WHEN og:image:alt is inspected
- THEN its content equals the value of the new es key
- AND it is non-empty and differs from the es og:description

#### Scenario: en alt text uses the new en key

- GIVEN an `en` page renders
- WHEN og:image:alt is inspected
- THEN its content equals the value of the new en key (English, non-empty)

### Requirement: Existing OG/twitter meta preserved

og:title, og:description, og:type, og:locale, og:url, twitter:card, twitter:title, and twitter:description MUST continue to render with their current values.

#### Scenario: Legacy meta still present

- GIVEN any page renders
- WHEN the head is inspected
- THEN og:title, og:description, og:type, og:locale, og:url, twitter:card, twitter:title, and twitter:description are all present
