# seo-jsonld Specification

## Purpose

Emit valid schema.org structured data on every page. A `site-info.ts` constants module becomes the single source of truth for person/business data; a reusable `JsonLd.astro` component injects `<script type="application/ld+json">` blocks. Person + ProfessionalService ship on ALL pages (injected via BaseLayout); FAQPage ships on home only, built from the SAME `funnel.faq` array the FAQ section renders — guaranteeing UI/schema parity with zero extra i18n keys.

## Requirements

### Requirement: site-info single source of truth

`src/constants/site-info.ts` MUST define the person/business data used by all JSON-LD builders: name `Juan Carlos Ávila`, jobTitle `Web Developer + AI Automation`, url `https://coltmandev.dev`, phone `+58 424 831 0009`, logo (`/favicon.svg`), and `sameAs` derived from `src/constants/social-links.ts` (GitHub, LinkedIn, X, Facebook hrefs). No other module MAY hardcode this identity data.

#### Scenario: site-info exposes full identity

- GIVEN `site-info.ts` is imported
- WHEN its exports are read
- THEN name, jobTitle, url, phone, and logo match the approved values
- AND `sameAs` contains exactly the 4 hrefs from `social-links.ts`

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

Person, ProfessionalService, and FAQPage builders MUST be typed functions (not inline literals in components) that derive their data from `site-info.ts` and the locale's translations. They MUST be pure — the same inputs MUST produce the same output — so unit tests can assert exact JSON shape.

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
