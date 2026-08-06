# section-buttons-grid Specification

## Status

SUPERSEDED (CSS grid layout). The grid migration was reverted in commit `0fe8fc4`: `SectionButtons.astro` went back to absolute positioning with the `positionClasses` map (6-point star layout around the hero canvas). What was KEPT from this change: the 6-button set including "Servicios" (`src/constants/section-buttons.ts`, `menu.services`), the icon + label layout, `data-section` attr, `bubble-hover`/`bubble-hover-end` events, `hover:scale-110`, and the `bg-surface-dark/80` + `border-on-dark-mute/30` tokens. The CSS Grid requirements below describe the intermediate (rejected) approach and are NOT satisfied by the live code.

## Purpose

Refactor `SectionButtons.astro` from 5 absolute-positioned navigation buttons to a responsive CSS Grid layout supporting 6 buttons (adding "Servicios") while preserving icon + label + hover animation behavior.

## Requirements

### Requirement: CSS Grid layout migration

The button container MUST use CSS Grid instead of absolute positioning. The grid SHALL render **6 buttons**: About, Skills, Services, Experience, Projects, Contact — in the order matching the nav bar.

#### Scenario: Six buttons render in grid

- GIVEN the `SectionButtons` component mounts on the index page
- WHEN the DOM is inspected
- THEN six `<a>` elements exist inside the grid container labelled: "Acerca de mí", "Mis Habilidades", "Servicios", "Experiencia Laboral", "Proyectos", "Contacto"

#### Scenario: No absolute positioning present

- GIVEN SectionButtons renders
- WHEN the computed styles of the container are inspected
- THEN no child element has `position: absolute` or hardcoded top/left/right/bottom values

### Requirement: Responsive grid columns

The grid MUST use `grid-cols-3` on viewports ≥ 1024px, `grid-cols-2` on 768–1023px, and fall back to a single-column or adapted layout below 768px.

#### Scenario: Desktop 3-column grid

- GIVEN viewport width ≥ 1024px
- WHEN the grid renders
- THEN exactly three columns display per row

#### Scenario: Tablet 2-column grid

- GIVEN viewport width is 768–1023px
- WHEN the grid renders
- THEN exactly two columns display per row

### Requirement: Hover animation preserved

Each button MUST retain the `bubble-hover` custom event dispatch on mouse enter/leave, the `hover:scale-110` transform, and the `data-section` attribute used by the hero canvas.

#### Scenario: Mouse enter triggers bubble-hover

- GIVEN a button in the grid
- WHEN the user hovers over it
- THEN `window.dispatchEvent(new CustomEvent('bubble-hover', { detail: button.dataset.section }))` fires

#### Scenario: Mouse leave triggers bubble-hover-end

- GIVEN a button is being hovered
- WHEN the user moves the cursor away
- THEN `window.dispatchEvent(new CustomEvent('bubble-hover-end'))` fires

### Requirement: Visual parity

The migrated buttons MUST match the existing design tokens: `bg-surface-dark/80` background, `border-on-dark-mute/30` border, icon + label layout with labels hidden below `md` breakpoint.

#### Scenario: Design tokens preserved

- GIVEN a button in the grid at desktop viewport
- WHEN inspecting styles
- THEN `bg-surface-dark/80`, `border-on-dark-mute/30`, and `rounded-lg` classes are applied
- AND the icon SVG and label text render side by side

#### Scenario: Icons only on mobile

- GIVEN viewport width < 768px
- WHEN a grid button renders
- THEN the label text is hidden (`hidden` or equivalent) and only the icon is visible
