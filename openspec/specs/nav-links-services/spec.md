# nav-links-services Specification

## Purpose

Add a "Servicios"/"Services" entry to the shared `navLinks` array so it appears in Header, FloatingNav, and MobileMenu across both locales.

## Requirements

### Requirement: Nav entry addition

The `navLinks` array in `src/constants/nav-links.ts` MUST include a new entry with `key: 'menu.services'` and `path: '/services'`, inserted between Skills (`/skills`) and Experience (`/experience`) to match the portfolio's logical section order.

#### Scenario: Entry exists in array

- GIVEN `navLinks` is exported
- WHEN iterating the array
- THEN an entry with `key === 'menu.services'` and `path === '/services'` is present
- AND its position is after the skills entry and before the experience entry

### Requirement: i18n label resolution

The `menu.services` key MUST resolve to "Servicios" in `messages/es.json` and "Services" in `messages/en.json`.

#### Scenario: Spanish label

- GIVEN locale is `es`
- WHEN `t('menu.services')` is called
- THEN it returns "Servicios"

#### Scenario: English label

- GIVEN locale is `en`
- WHEN `t('menu.services')` is called
- THEN it returns "Services"

### Requirement: Link auto-propagation to navigation components

Adding the entry to `navLinks` MUST cause it to render automatically in Header (desktop nav), FloatingNav (bottom floating bar), and MobileMenu (slide-in overlay) without per-component changes.

#### Scenario: Header renders services link

- GIVEN the services page is loaded at `/es/services`
- WHEN inspecting the Header's desktop nav
- THEN a link with text "Servicios" and `href="/es/services"` is present

#### Scenario: FloatingNav renders services link

- GIVEN any page is loaded at desktop viewport
- WHEN inspecting the FloatingNav bottom bar
- THEN a link labelled "Servicios" (ES) or "Services" (EN) with correct `href` is present

#### Scenario: MobileMenu renders services link

- GIVEN a mobile viewport
- WHEN the MobileMenu is opened
- THEN a link labelled "Servicios" (ES) or "Services" (EN) with correct `href` is present

### Requirement: Active state detection

Navigation components that apply active-link styling SHALL treat `/services` as the active path when the current route matches `/[locale]/services`.

#### Scenario: Active state on services page

- GIVEN the user is on `/es/services`
- WHEN the Header renders nav links
- THEN the Services link has an active state (e.g., `text-ink` vs muted, or equivalent active class)
