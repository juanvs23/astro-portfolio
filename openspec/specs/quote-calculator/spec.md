# quote-calculator Specification

## Purpose

Client-side IA-only quote calculator. User selects project scale and urgency → estimated USD range → WhatsApp CTA. Zero backend dependency. Works in both locales. Accessible with JS fallback.

## Requirements

### Requirement: 2-step selection flow (IA only)

The calculator MUST present two sequential steps: (1) Scale — Starter / Pro / Suite, (2) Urgency — Tranquilo / Normal / Urgente. No category selection step. Advancing to the next step SHALL require a valid selection.

#### Scenario: User completes both steps

- GIVEN the calculator is loaded
- WHEN the user selects "Pro" → "Urgente"
- THEN the result shows an estimated USD range and a WhatsApp CTA appears

#### Scenario: User cannot skip steps

- GIVEN step 1 is active
- WHEN the user clicks "Next" without selecting
- THEN the calculator SHALL remain on step 1 with validation feedback

### Requirement: IA pricing matrix (9 paths)

The calculator MUST compute estimates from a client-side matrix: 3 scales × 3 urgencies = 9 paths. Base ranges SHALL be: Starter $300–$500, Pro $600–$1,200, Suite $1,200–$2,500. Urgency multipliers: Tranquilo ×1.0, Normal ×1.2, Urgente ×1.5.

#### Scenario: Urgency multiplier applied

- GIVEN scale "Starter"
- WHEN urgency is "Urgente"
- THEN the estimated range is higher than "Tranquilo" for the same scale

#### Scenario: All 9 paths produce valid ranges

- GIVEN the pricing matrix is initialized
- WHEN every scale × urgency combination is computed
- THEN each result is a non-empty `[min, max]` tuple where min > 0 and max >= min

### Requirement: WhatsApp CTA with pre-filled message

The result step MUST render `https://wa.me/{number}?text={encoded}`. The message SHALL include the selected scale, urgency, and resulting range. Number from `contact.whatsappNumber` in i18n.

#### Scenario: WhatsApp link encodes IA selections

- GIVEN user selected "Pro → Normal" yielding $720–$1,440
- WHEN the WhatsApp button renders
- THEN `href` encodes text containing "Pro", "Normal", and the range

### Requirement: Graceful degradation without JavaScript

When JavaScript is disabled, the calculator MUST hide interactive steps and SHALL show a fallback WhatsApp CTA.

#### Scenario: JS disabled shows fallback

- GIVEN JavaScript is disabled
- WHEN the services page loads
- THEN a visible fallback message invites WhatsApp contact, and interactive steps are hidden

### Requirement: Accessibility and responsiveness

The calculator MUST support keyboard navigation (Tab/Enter/Space), use semantic elements, maintain 44×44px touch targets, and adapt to single-column layout on viewports below 768px.

#### Scenario: Keyboard operable

- GIVEN the calculator is focused
- WHEN Tab and Enter are used to navigate and select
- THEN all interactions work without a pointer device, and focus rings are visible

#### Scenario: Mobile single-column layout

- GIVEN a viewport width of 375px
- WHEN calculator steps render
- THEN options stack vertically in a single column, and touch targets are ≥44×44px
