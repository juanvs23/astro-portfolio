# web-plans Specification

## Purpose

Desarrollo Web section rendering 3 visible plan cards: Básico ($120), Profesional ($250), E-commerce ($500). Each shows starting price ("desde $X"), delivery estimate, feature list, and WhatsApp CTA. Launch pricing badge applies 15% discount visually. Responsive grid: 1 col mobile, 3 cols desktop.

## Requirements

### Requirement: Three plan cards with visible pricing

The section MUST render 3 plan cards sourced from `services.webPlans[]`:

| Card | Price | Delivery | Features |
|------|-------|----------|----------|
| 🥉 Básico | desde $120 | 3 días | Landing page / sitio 3 páginas, responsive, SEO básico |
| 🥈 Profesional | desde $250 | 7 días | WordPress 5+ páginas, blog, formularios, optimización |
| 🥇 E-commerce | desde $500 | 14 días | WooCommerce, pasarelas de pago, productos, envíos, panel admin |

Prices MUST be visible on cards — not gated behind calculator or WhatsApp.

#### Scenario: All three cards render with prices

- GIVEN the services page loads
- WHEN the Desarrollo Web section is inspected
- THEN 3 cards exist displaying Básico/$120, Profesional/$250, E-commerce/$500 with "desde" prefix

#### Scenario: Each card shows feature list

- GIVEN any plan card renders
- WHEN inspected
- THEN it displays at least 3 deliverables from its `features[]` array

### Requirement: Recommended tier highlight

The Profesional tier MUST be visually distinguished as recommended — via distinct border, accent, or "Recomendado"/"Popular" badge. Básico and E-commerce SHALL remain neutral.

#### Scenario: Profesional card visually distinct

- GIVEN all 3 cards render
- WHEN comparing visual treatment across cards
- THEN Profesional has a distinguishing badge or accent not present on the other two

### Requirement: Launch pricing badge

The section MUST display a launch pricing badge indicating 15% off for the first 3–6 months, sourced from `services.launchPricing`. The displayed prices SHALL reflect the discounted amount.

#### Scenario: Discount badge visible

- GIVEN the section renders
- WHEN inspected
- THEN a badge or note referencing 15% launch discount appears near the plan cards

### Requirement: WhatsApp CTA per card

Each card MUST include a WhatsApp CTA button with a pre-filled message containing the plan name and starting price. Button href SHALL use `https://wa.me/{number}?text={encoded}` with number from `contact.whatsappNumber`.

#### Scenario: Básico card CTA encodes plan details

- GIVEN the Básico card renders
- WHEN the WhatsApp button is inspected
- THEN its href encodes a message referencing "Plan Básico — desde $120"

### Requirement: Responsive grid layout

Cards MUST render in a responsive CSS grid: 1 column on viewports <768px, 3 columns on viewports ≥1024px. Cards SHALL maintain equal height within each row.

#### Scenario: Desktop 3-column layout

- GIVEN viewport width ≥1024px
- WHEN cards render
- THEN 3 cards display side by side in a single row

#### Scenario: Mobile single-column layout

- GIVEN viewport width 375px
- WHEN cards render
- THEN cards stack vertically, each at full available width
