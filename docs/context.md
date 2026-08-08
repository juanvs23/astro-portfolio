# Project Context

Particularidades del proyecto que los agentes deben conocer.

## Animación de botones CTA (`plan-cta`)

Todos los botones CTA del funnel usan el componente reutilizable `<CtaButton>` (`src/components/ui/CtaButton.astro`).
**No crear nuevos `<a>` con `plan-cta` manualmente — usar siempre el componente.**

El efecto hover se implementa con pseudo-elementos `::before` y `::after` en `global.css`:

- `::after` — capa base que hereda el `background-color` del botón.
- `::before` — barra que se expande de izquierda a derecha (`width: 0% → 100%`) con `var(--color-accent-hover)`.

**Variantes del componente:** `dark` (default), `light`, `primary`, `accent`.
Layout personalizable vía prop `class`.

**Regla**: No remover las reglas `plan-cta` de `global.css` sin antes consultar.

## Stack

- Astro (SSG)
- Tailwind CSS
- i18n con rutas `/[locale]/...`
