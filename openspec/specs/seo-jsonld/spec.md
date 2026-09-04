# seo-jsonld Specification

## Purpose

Emit valid schema.org structured data on every page. Identity data (name, jobTitle, url, phone, logo, `sameAs`) is sourced from the CMS `siteInfo` API at render time with a fallback to the static `site-info.ts` constants when the API/Mongo is unavailable, so structured data never breaks. A reusable `JsonLd.astro` component injects `<script type="application/ld+json">` blocks. Person + ProfessionalService ship on ALL pages (injected via BaseLayout); FAQPage ships on home only, built from the SAME `funnel.faq` array the FAQ section renders.

## Requirements

### Requirement: site-info from CMS API with constant fallback

`buildSiteJsonLd` MUST source person/business data (name, jobTitle, url, telephone, logo, `sameAs`) from the CMS `siteInfo` API, falling back to `src/constants/site-info.ts` (including `sameAs` derived from `social-links.ts`) when the API or Mongo is unavailable. No other module MAY hardcode this identity data. The fallback MUST keep the page's structured data valid (no 500, no missing Person node).

#### Scenario: API available supplies identity

- GIVEN the CMS `siteInfo` API is reachable and returns valid data
- WHEN `buildSiteJsonLd` runs
- THEN the emitted identity uses the API values for name, jobTitle, url, phone, logo, and `sameAs`

#### Scenario: API down falls back to constants

- GIVEN the CMS `siteInfo` API or Mongo is unavailable
- WHEN `buildSiteJsonLd` runs
- THEN it uses the static `site-info.ts` values
- AND the page renders a valid Person node without a 500

#### Scenario: Fallback sameAs matches social constants

- GIVEN the fallback path is taken
- WHEN the `sameAs` array is read
- THEN it equals the 4 hrefs from `social-links.ts`

### Requirement: Reusable JSON-LD emitter

A `JsonLd.astro` component MUST accept one or more schema objects and MUST render `<script type="application/ld+json">` tags with `@context: "https://schema.org"` preserved on every object. The component MUST be safe for zero-object and multi-object usage.

#### Scenario: Emits script tags with schema.org context

- GIVEN a page passes one Person object to `JsonLd.astro`
- WHEN the page renders
- THEN the head contains a `<script type="application/ld+json">` block
- AND the parsed JSON has `@context` equal to `https://schema.org`

#### Scenario: Multiple objects render as separate tags

- GIVEN a page passes Person and ProfessionalService objects
- WHEN the page renders
- THEN two valid JSON-LD script tags appear, each parseable independently

### Requirement: Typed, pure, testable builders

Person, ProfessionalService, and FAQPage builders MUST be typed functions (not inline literals in components) that derive their data from the resolved site-info source and the locale's translations. They MUST be pure — the same inputs MUST produce the same output — so unit tests can assert exact JSON shape.

#### Scenario: Builder output is deterministic

- GIVEN the same locale and site-info inputs
- WHEN a builder is invoked twice
- THEN both results deep-equal

### Requirement: Person + ProfessionalService on every page

Every page rendered through BaseLayout MUST emit a Person node AND a ProfessionalService node. Person MUST include `name`, `jobTitle`, `url`, `telephone`, `sameAs` (4 social URLs), and `image`/`logo`. ProfessionalService MUST reference the same person (e.g. via `founder`/`employee` or `url`) and advertise the site as the service provider. This applies to home, about, skills, experience, projects, services, automation, and contact in both locales.

#### Scenario: es page carries Person with 4 sameAs URLs

- GIVEN a page in `es` (e.g. `/es/services`) renders through BaseLayout
- WHEN the JSON-LD blocks are parsed
- THEN a Person node exists with name `Juan Carlos Ávila` and jobTitle `Web Developer + AI Automation`
- AND `sameAs` contains all 4 social URLs
- AND a ProfessionalService node exists alongside it

#### Scenario: Non-home pages still get Person + ProfessionalService

- GIVEN `/en/contact` renders
- WHEN its JSON-LD is parsed
- THEN both Person and ProfessionalService nodes are present

### Requirement: FAQPage on home only, from the same funnel.faq source

The home page (per locale) MUST emit an FAQPage node with 5 `mainEntity` Question items built from the SAME `t('funnel.faq')` array consumed by `FaqSection` — one `Question`/`acceptedAnswer` pair per item, question text and answer text copied verbatim. Non-home pages MUST NOT emit FAQPage.

#### Scenario: FAQPage matches the FAQ section Q&As

- GIVEN `/es` (home) renders
- WHEN the FAQPage node is parsed and compared to `t('funnel.faq')`
- THEN it has exactly 5 `mainEntity` items
- AND item N's `name`/`text` equal the FAQ section's Nth question/answer for the same locale

#### Scenario: Home EN uses the EN funnel.faq array

- GIVEN `/en` (home) renders
- WHEN the FAQPage node is parsed
- THEN its 5 questions match `t('funnel.faq')` for `en` (English text)

#### Scenario: Services page has no FAQPage

- GIVEN `/es/services` renders
- WHEN its JSON-LD is parsed
- THEN no FAQPage node is present

#### Scenario: No FAQ content leaves the page valid

- GIVEN `funnel.faq` were empty or missing for a locale
- WHEN home renders
- THEN no FAQPage node is emitted and no other JSON-LD breaks