# og-image — Prompt para Gemini

> Generar la imagen de share social (Open Graph) 1200x630 del sitio coltmandev.dev.
> Cuando la tengas, guardala en `public/og-image.jpg` del repo.

## Prompt (copiar en Gemini)

> Design a 1200x630 social share (Open Graph) image for the personal brand of "Juan Carlos Ávila", a Web Developer + AI Automation specialist from Venezuela.
>
> **Style (strict constraints):**
> - Background: solid cream color #fdfcfc. NO gradients, NO shadows, NO 3D effects.
> - Typography: 100% monospaced font (like JetBrains Mono / IBM Plex Mono), bold weight, black ink #201d1d.
> - Decorative elements: ASCII-style terminal aesthetics — square brackets like `[+]`, `[x]`, a simple terminal window outline with a title bar, small monospace code-like lines. Minimal, technical, clean.
> - Layout: left-aligned or centered composition with generous whitespace. Hairline borders (1px, subtle gray #e5e2de) separating blocks, flat 2D.
> - No photos, no person portraits, no clipart, no emojis.
>
> **Content (exact text):**
> - Main headline: "Web Dev + AI Automation"
> - Subline: "Desarrollo web orientado a conversión y automatización con IA"
> - Small terminal mock line: `➜ juan@dev:~/portfolio`
> - Small footer line: "coltmandev.dev"
>
> **Tone:** professional, technical, minimalist, developer-portfolio aesthetic. The image must look like a high-quality landing hero, not a generic business banner.

## Especificación técnica

| Requisito | Valor |
| --- | --- |
| Dimensiones | **1200 × 630 px** (ratio Open Graph estándar) |
| Fondo | Crema `#fdfcfc` (consistente con el sitio) |
| Restricciones | Sin gradientes ni sombras (regla de DESIGN.md) |
| Legibilidad | Texto claro incluso en previews pequeños (WhatsApp/LinkedIn) |
| Peso | < 200KB idealmente (JPEG) |
| Destino | `public/og-image.jpg` |

## Checklist al guardarla

- [ ] Archivo en `public/og-image.jpg`
- [ ] Dimensiones 1200x630 (verificar: `file public/og-image.jpg` o `identify`)
- [ ] Peso razonable (< 200KB)
- [ ] Previsualizar el share en WhatsApp/LinkedIn para confirmar que el texto se lee
