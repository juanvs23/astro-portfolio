# services-content Specification

## Purpose

Bilingual i18n content for: Desarrollo Web plan cards (3, with visible pricing), IA quote calculator (no prices), Express services (6, price-gated), process steps (3), launch pricing badge, and EN AI-translation note.

## Requirements

### Requirement: Web plan cards content

i18n files MUST define `services.webPlans[]` with 3 tiers:

| Tier | Price | Delivery | Recommended |
|------|-------|----------|-------------|
| Básico | $120 | 3 días | No |
| Profesional | $250 | 7 días | Yes |
| E-commerce | $500 | 14 días | No |

Each entry MUST include `name`, `startingPrice` (number), `delivery` (string), `features[]` (3+ items), and `recommended` (boolean). Prices display as "desde $X".

#### Scenario: ES web plan data resolves

- GIVEN locale `es`
- WHEN `services.webPlans[0]` is accessed
- THEN `.name` is "Básico", `.startingPrice` is 120, `.delivery` is "3 días"

#### Scenario: EN web plan data resolves

- GIVEN locale `en`
- WHEN `services.webPlans[2]` is accessed
- THEN `.name` is "E-commerce", `.startingPrice` is 500, `.delivery` is "14 days"

### Requirement: IA section content (price-free)

i18n files MUST define `services.ia` with `heading` and `description` referencing the quote calculator. MUST NOT expose fixed prices or ranges in content — all pricing flows through the calculator widget.

#### Scenario: IA section omits prices

- GIVEN any locale
- WHEN `services.ia` renders
- THEN no monetary amounts appear in section heading or description

### Requirement: Express services content

i18n files MUST define 6 items in `services.express[]`, each with `name` and `description`. Prices MUST NOT appear in public content — WhatsApp-gated.

#### Scenario: Six express services loaded

- GIVEN any locale
- WHEN `services.express` is rendered
- THEN exactly 6 items exist with non-empty `name` and `description`

### Requirement: Process steps

i18n files MUST define `services.process[]` with 3 steps: `step` (number), `title`, `description` — in order.

#### Scenario: Three steps in order

- GIVEN any locale
- WHEN `services.process` is iterated
- THEN three items exist with `step` values 1, 2, 3

### Requirement: Launch pricing badge

i18n MUST include `services.launchPricing` with `badge` and `note`. The badge SHALL indicate 15% discount applied to web plan cards for the first 3–6 months.

#### Scenario: Launch badge visible on web plans section

- GIVEN the services page renders
- WHEN the Desarrollo Web section is inspected
- THEN a badge or callout referencing 15% launch discount appears near the plan cards

### Requirement: English AI translation note

The `en` locale MUST include `services.aiNote` with an AI-assisted translation disclaimer. The `es` locale MUST NOT display it.

#### Scenario: EN shows AI note, ES omits it

- GIVEN locale `en` → AI note visible; locale `es` → AI note absent

### Requirement: IA calculator labels i18n

i18n files MUST define `services.calculator` with: scale step labels (Starter/Pro/Suite with descriptions), urgency step labels (Tranquilo/Normal/Urgente), result text, and WhatsApp CTA text. No category step labels needed (IA-only calculator).

#### Scenario: Scale step labels resolve in ES

- GIVEN locale `es`
- WHEN `services.calculator.steps[0].label` is accessed
- THEN it returns Spanish text for the scale selection step

#### Scenario: IA option descriptions resolve

- GIVEN locale `es`
- WHEN `services.calculator.scaleOptions[0]` is accessed
- THEN it includes a description referencing "Chatbot RAG con documentación"
