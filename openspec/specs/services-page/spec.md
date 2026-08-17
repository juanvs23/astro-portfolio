# services-page Specification

## Purpose

New Astro page route at `/[locale]/services` serving the commercial services page with SEO metadata and i18n support for both Spanish and English locales.

## Requirements

### Requirement: Services page route

The system MUST serve a page at `/[locale]/services` for each configured locale (`es`, `en`) following the existing `skills.astro` page pattern.

**Structure**: `getStaticPaths` → `SectionLayout` → `ServicesSection`.

#### Scenario: ES locale renders services page

- GIVEN the `es` locale is configured
- WHEN a user navigates to `/es/services`
- THEN the page renders with Spanish SEO title and meta description
- AND the Content-Type is `text/html` with status 200

#### Scenario: EN locale renders services page

- GIVEN the `en` locale is configured
- WHEN a user navigates to `/en/services`
- THEN the page renders with English SEO title and meta description
- AND the English translation note is present

#### Scenario: SEO metadata uses i18n keys

- GIVEN the services page for any locale
- WHEN the page HTML is inspected
- THEN `seo.pages.services` populates `<title>` and `seo.descriptions.services` populates `<meta name="description">`

### Requirement: SectionLayout usage

The services page MUST wrap its content in `SectionLayout`, which provides `Header`, `MobileMenu`, `Footer`, and `BaseLayout` with SEO injection.

#### Scenario: Page inherits layout shell

- GIVEN the services page is rendered
- WHEN inspecting the DOM
- THEN the page includes Header with navigation, MobileMenu, main element, and Footer
- AND the `pt-[56px]` offset exists for the fixed header

### Requirement: Prerendering

The services page MUST use `export const prerender = true` for static generation at build time.

#### Scenario: Build succeeds with static output

- GIVEN the project is built with `npm run build`
- WHEN the services routes are generated
- THEN `es/services/index.html` and `en/services/index.html` exist in the output
- AND no runtime errors occur
