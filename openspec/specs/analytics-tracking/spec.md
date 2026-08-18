# Analytics Tracking Specification

## Purpose

Env-gated Google Tag Manager (GTM) analytics on every page via `BaseLayout`: one container, `pageview` on every load/soft navigation, and WhatsApp/audit CTA conversions. Pure helpers in `src/lib/gtm.ts`; disabled when no container ID is set. No hardcoded IDs; no-JS/SEO unaffected.

## Requirements

| Req | Requirement | Strength |
|-----|-------------|----------|
| R1 | Env-gated GTM injection | MUST |
| R2 | `pageview` on `astro:page-load` | MUST |
| R3 | `whatsapp_cta` via delegated listener | MUST |
| R4 | `contact_whatsapp_cta` in LeadForm handler | MUST |
| R5 | `audit_cta` in LeadForm handler | MUST |
| R6 | `plan_whatsapp_cta` with `plan` param | MUST |
| R7 | Pure helper contract | MUST |
| R8 | Strict TDD: RED first | MUST |

### Requirement: R1 — Env-gated GTM injection

GTM head (after `<ViewTransitions />`) and noscript body (after `<body>`) render only when `PUBLIC_GTM_CONTAINER_ID` is non-empty. The ID MUST NOT be hardcoded.

#### Scenario: Container configured

- GIVEN `PUBLIC_GTM_CONTAINER_ID` is non-empty
- WHEN a page renders through `BaseLayout`
- THEN the head has the GTM loader and the body the noscript fallback

#### Scenario: Empty or unset

- GIVEN the ID is empty
- WHEN any page renders
- THEN the HTML has no GTM scripts or `dataLayer` refs

### Requirement: R2 — Pageview on every load

Push a `pageview` on every `astro:page-load`. Auto-pageview MUST be disabled to avoid double-counting the first load.

#### Scenario: Initial load

- GIVEN a page loads with GTM on
- WHEN `astro:page-load` fires
- THEN one `pageview` is pushed

#### Scenario: Soft navigation

- GIVEN the user soft-navigates
- WHEN `astro:page-load` fires
- THEN an additional `pageview` is pushed

### Requirement: R3 — General WhatsApp CTA

A delegated document listener on `a[href*="wa.me"]` (bubble phase) fires `whatsapp_cta` for general CTAs.

#### Scenario: General wa.me click

- GIVEN a non-form `a[href*="wa.me"]` is clicked
- WHEN it bubbles to the document listener
- THEN a `whatsapp_cta` is pushed

#### Scenario: LeadForm and plan CTAs excluded

- GIVEN the clicked link is a LeadForm or plan CTA
- WHEN it bubbles
- THEN no `whatsapp_cta` is pushed (those fire their own events)

### Requirement: R4 — Contact-form WhatsApp CTA

Push `contact_whatsapp_cta` inside `LeadForm`'s click handler when `source === 'contact'` (`stopPropagation()` hides it from delegation).

#### Scenario: Contact-form CTA clicked

- GIVEN `LeadForm` has `context='contact'`
- WHEN the button is clicked
- THEN a `contact_whatsapp_cta` is pushed

### Requirement: R5 — Audit CTA

Push `audit_cta` inside `LeadForm`'s click handler when `source === 'audit'`.

#### Scenario: Audit CTA clicked

- GIVEN `LeadForm` has `context='audit'`
- WHEN the button is clicked
- THEN an `audit_cta` is pushed

### Requirement: R6 — Services plan WhatsApp CTA

Fire `plan_whatsapp_cta` for plan CTAs, each carrying a `plan` param from a required `data-gtm-plan` attribute read by the delegated listener.

#### Scenario: Plan CTA clicked

- GIVEN a plan CTA has `data-gtm-plan="Básico"` (or `Profesional`, `E-commerce`)
- WHEN the delegated listener fires
- THEN `plan_whatsapp_cta` is pushed with `plan` = that value

#### Scenario: Non-plan wa.me link

- GIVEN a wa.me link without `data-gtm-plan`
- WHEN it bubbles
- THEN `plan_whatsapp_cta` is NOT fired

### Requirement: R7 — Pure helper contract

`src/lib/gtm.ts` exposes `shouldLoadGtm(containerId)` → boolean, `buildDataLayerEvent(name, payload)` → event object, and `pushDataLayer` as a thin DOM wrapper.

#### Scenario: Load decision

- GIVEN `shouldLoadGtm('')` and `shouldLoadGtm(undefined)`
- WHEN called
- THEN both are `false`

#### Scenario: Event shape

- GIVEN `buildDataLayerEvent('pageview', { page: '/es' })`
- WHEN called
- THEN it returns `{ event: 'pageview', page: '/es' }`

### Requirement: R8 — Strict TDD

Tests MUST precede implementation (`RED` first), run with `npx vitest run`.

#### Scenario: RED before GREEN

- GIVEN a helper does not yet exist
- WHEN its test is written first
- THEN the test fails, then passes after minimal code

## Out of Scope

Consent (GDPR/CCPA) and CSP are follow-ups; GTM tags are dashboard-configured.
