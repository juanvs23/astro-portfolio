# seo-sitemap Specification

## Purpose

Extend the manual sitemap route (`src/pages/sitemap.xml.ts`) so every locale URL carries xhtml:link hreflang alternates, the previously missing `/services` and `/automation` pages are indexed, and the base URL derives from `Astro.site` instead of a hardcoded domain.

## Requirements

### Requirement: Full page coverage

The sitemap PAGES list MUST include `/services` and `/automation` in addition to the existing `/`, `/about`, `/skills`, `/experience`, `/projects`, `/contact`. Every page MUST be emitted once per locale (`/es/...` and `/en/...`), matching `prefixDefaultLocale` routing.

#### Scenario: Services and automation are indexed

- GIVEN the sitemap route is requested
- WHEN `GET /sitemap.xml` is served
- THEN it contains `<loc>` entries for `/es/services`, `/en/services`, `/es/automation`, and `/en/automation`

#### Scenario: All locales and pages present

- GIVEN the sitemap route
- WHEN the XML is parsed
- THEN every PAGES entry exists under both `/es` and `/en` prefixes

### Requirement: xhtml:link hreflang alternates

Each `<url>` block MUST emit `<xhtml:link rel="alternate" hreflang="es">` and `<xhtml:link rel="alternate" hreflang="en">` pointing to the localized equivalent of that URL, with the urlset namespace declared for xhtml.

#### Scenario: Alternates on the automation pages

- GIVEN the sitemap route
- WHEN the `<url>` block for `/es/automation` is inspected
- THEN it contains an alternate for `hreflang="en"` at `/en/automation`
- AND an alternate for `hreflang="es"` at `/es/automation`

#### Scenario: Alternates on the root page

- GIVEN the sitemap route
- WHEN the `<url>` block for `/es` is inspected
- THEN its alternates point to `/es` and `/en`

### Requirement: Base URL derived from Astro.site

The sitemap MUST build every `<loc>` and alternate href from `Astro.site` (the configured `site: 'https://coltmandev.dev'`), not a hardcoded constant. If `Astro.site` is unavailable, the route MUST fall back to `https://coltmandev.dev` rather than emit malformed URLs.

#### Scenario: Loc uses the configured site

- GIVEN `site` is configured as `https://coltmandev.dev`
- WHEN the sitemap renders
- THEN all `<loc>` values start with `https://coltmandev.dev`
- AND no hardcoded SITE_URL constant is used

### Requirement: Sitemaps.org-compatible structure

The document MUST remain a valid XML urlset with the sitemaps.org namespace, keeping `lastmod` (today's date), `changefreq` (`weekly` for the locale roots, `monthly` otherwise), and `priority` (`1.0` for roots, `0.8` otherwise) per URL. Adding xhtml alternates MUST NOT drop these fields.

#### Scenario: XML remains valid and complete

- GIVEN `GET /sitemap.xml`
- WHEN the response body is parsed as XML
- THEN it is well-formed with `urlset` root and sitemaps.org namespace
- AND every `<url>` keeps `lastmod`, `changefreq`, and `priority`
