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

## Estrategia del sitio (2026-08-12)

**Decisión: el sitio funciona como un embudo de venta (funnel).**

La home es una landing AIDA de 12 secciones orientada a conversión (auditoría + WhatsApp). Las páginas interiores deben **reencuadrarse como evidencia de venta**, no como portfolio personal:

| Página | Rol en el embudo |
|--------|------------------|
| Home | Embudo AIDA: problema → solución → CTA auditoría |
| /services | Oferta (planes con precios) |
| /experience | Evidencia: resultados entregados (no trayectoria CV) |
| /projects | Casos de clientes (no portafolio) |
| /about | Confianza: "tu socio técnico" |
| /contact | Cierre |

**Pendiente (varado, no implementado):** sección de Blog / Guías evergreen para tráfico orgánico (SEO topo del embudo). Recomendación anotada: guías cortas evergreen ("Cómo mejorar conversión de tu landing", "Automatiza WhatsApp con n8n") en vez de blog personal; alimentar CTA de auditoría al final de cada guía. **NO implementar hasta definir la estrategia completa** (i18n es/en duplica costo; requiere constancia de publicación).

**Pendiente:** reencuadrar H1s y copy de /experience, /projects, /about, /contact para alinearlos al embudo (hoy hablan de "trayectoria/portafolio").

**Pendiente (SEO):** realizar una revisión SEO completa del sitio y mejorarlo — metas/títulos por página, schema.org (LocalBusiness/Person/Service), sitemap, Open Graph, rendimiento Core Web Vitals, contenido orientado a intención de búsqueda de servicios de conversión/IA.
