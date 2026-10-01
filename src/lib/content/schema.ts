import { z } from 'zod';

/**
 * Zod contract for the WordPress headless projects API (CPT `projects`,
 * REST base `portafolio`) consumed at build time:
 *
 *   GET {PUBLIC_WP_API_URL}?_embed&orderby=menu_order&order=asc&per_page=100
 *
 * Verified live 2026-09-30 — 18 items. Checkbox fields (`featured`,
 * `visible`) arrive as the STRINGS `'on'`/`''` because the WP meta REST
 * contract serializes them that way. WP core also injects an extra
 * `meta.footnotes` key: the default (non-strict) zod object behavior strips
 * unknown keys, which is exactly what we want — never call `.strict()`.
 */

const featuredMediaSchema = z.object({
  source_url: z.url(),
  media_details: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export const wpProjectSchema = z.object({
  slug: z.string(),
  title: z.object({ rendered: z.string() }),
  menu_order: z.number().int(),
  meta: z.object({
    desc_es: z.string(),
    desc_en: z.string(),
    url: z.url(),
    tech: z.string(),
    show_on: z.enum(['portfolio', 'sales', 'both']),
    featured: z.string(),
    visible: z.string(),
  }),
  _embedded: z.object({
    'wp:featuredmedia': z.array(featuredMediaSchema).min(1),
  }),
});

// `.min(1)`: an empty collection is treated as an invalid source — the layer
// must fall back to the committed snapshot instead of silently rendering an
// empty projects page (the documented contract in src/lib/content/projects.ts).
export const wpProjectsSchema = z.array(wpProjectSchema).min(1);

export type WPProject = z.infer<typeof wpProjectSchema>;

/** Domain model consumed by the Astro sections — WP-free shape. */
export interface Project {
  slug: string;
  name: string;
  url: string;
  desc: { es: string; en: string };
  tech: string;
  showOn: 'portfolio' | 'sales' | 'both';
  featured: boolean;
  visible: boolean;
  order: number;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

const CHECKED = 'on';

/** Map one validated WP item to the domain `Project`. */
export function mapProject(wp: WPProject): Project {
  const media = wp._embedded['wp:featuredmedia'][0];
  return {
    slug: wp.slug,
    name: wp.title.rendered,
    url: wp.meta.url,
    desc: { es: wp.meta.desc_es, en: wp.meta.desc_en },
    tech: wp.meta.tech,
    showOn: wp.meta.show_on,
    featured: wp.meta.featured === CHECKED,
    visible: wp.meta.visible === CHECKED,
    order: wp.menu_order,
    imageUrl: media.source_url,
    imageWidth: media.media_details.width,
    imageHeight: media.media_details.height,
  };
}
