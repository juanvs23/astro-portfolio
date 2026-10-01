import { describe, it, expect } from 'vitest';
import { wpProjectsSchema, mapProject } from './schema';
import type { WPProject } from './schema';

// ---------------------------------------------------------------------------
// WP headless payload schema + domain mapping (Phase 2 of wordpress-headless).
// Fixtures derive from the REAL live API item "gericht" (verified 2026-09-30):
// GET /wp-json/wp/v2/portafolio?_embed — trimmed to the keys under contract.
// ---------------------------------------------------------------------------

const gerichtFixture = {
  id: 10,
  slug: 'gericht',
  title: { rendered: 'Gericht' },
  menu_order: 2,
  meta: {
    desc_es: 'Landing page de restaurante con menú, galería y reservas. Diseño responsivo.',
    desc_en:
      'Restaurant landing page with menu, gallery, and reservations. Responsive design.',
    url: 'https://restaurant.coltmandev.dev/',
    tech: '',
    show_on: 'portfolio',
    featured: 'on',
    visible: 'on',
    // WP core injects this extra key — the schema must tolerate it.
    footnotes: '',
  },
  _embedded: {
    'wp:featuredmedia': [
      {
        id: 11,
        alt_text: '',
        source_url:
          'https://projects.coltmandev.dev/porfolio/wp-content/uploads/2026/09/gericht.jpg',
        media_details: {
          width: 1920,
          height: 2246,
        },
      },
    ],
  },
};

/** Minimal well-formed item builder (variants of the real fixture). */
function makeItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...gerichtFixture,
    ...overrides,
    meta: { ...gerichtFixture.meta, ...(overrides.meta as object) },
    _embedded: {
      'wp:featuredmedia': [
        {
          ...gerichtFixture._embedded['wp:featuredmedia'][0],
        },
      ],
    },
    ...(overrides._embedded ? { _embedded: overrides._embedded } : {}),
  };
}

describe('wpProjectsSchema', () => {
  it('accepts a real payload item and strips the extra meta "footnotes" key', () => {
    const result = wpProjectsSchema.safeParse([gerichtFixture]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const [item] = result.data;
    expect(item.slug).toBe('gericht');
    expect(item.title.rendered).toBe('Gericht');
    expect(item.menu_order).toBe(2);
    expect(item.meta.desc_es).toContain('restaurante');
    expect(item.meta.desc_en).toContain('Restaurant');
    expect(item.meta.url).toBe('https://restaurant.coltmandev.dev/');
    expect(item.meta.show_on).toBe('portfolio');
    expect(item.meta.featured).toBe('on');
    expect(item.meta.visible).toBe('on');
    // footnotes must not leak into the parsed output (default strips it).
    expect('footnotes' in item.meta).toBe(false);
    expect(item._embedded['wp:featuredmedia'][0].source_url).toContain('gericht.jpg');
    expect(item._embedded['wp:featuredmedia'][0].media_details.width).toBe(1920);
    expect(item._embedded['wp:featuredmedia'][0].media_details.height).toBe(2246);
  });

  it('rejects an item missing meta.url', () => {
    // Replace meta wholesale: makeItem merges partial meta over the fixture,
    // which would silently re-add the very key this test must remove.
    const { url: _url, ...metaWithoutUrl } = gerichtFixture.meta;
    const item = { ...gerichtFixture, meta: metaWithoutUrl };
    const result = wpProjectsSchema.safeParse([item]);
    expect(result.success).toBe(false);
  });

  it('rejects an item with a show_on value outside the contract enum', () => {
    const item = makeItem({ meta: { show_on: 'everywhere' } });
    const result = wpProjectsSchema.safeParse([item]);
    expect(result.success).toBe(false);
  });

  it('rejects an item whose embedded media lacks media_details', () => {
    const item = makeItem({
      _embedded: {
        'wp:featuredmedia': [
          {
            id: 11,
            source_url: 'https://projects.coltmandev.dev/porfolio/a.jpg',
          },
        ],
      },
    });
    const result = wpProjectsSchema.safeParse([item]);
    expect(result.success).toBe(false);
  });

  it('rejects a payload that is not an array of items', () => {
    const result = wpProjectsSchema.safeParse({ not: 'an array' });
    expect(result.success).toBe(false);
  });
});

describe('mapProject', () => {
  it('maps a validated WP item to the domain Project (featured "on" → true)', () => {
    const result = wpProjectsSchema.safeParse([gerichtFixture]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const project = mapProject(result.data[0] as WPProject);
    expect(project).toEqual({
      slug: 'gericht',
      name: 'Gericht',
      url: 'https://restaurant.coltmandev.dev/',
      desc: {
        es: 'Landing page de restaurante con menú, galería y reservas. Diseño responsivo.',
        en: 'Restaurant landing page with menu, gallery, and reservations. Responsive design.',
      },
      tech: '',
      showOn: 'portfolio',
      featured: true,
      visible: true,
      order: 2,
      imageUrl:
        'https://projects.coltmandev.dev/porfolio/wp-content/uploads/2026/09/gericht.jpg',
      imageWidth: 1920,
      imageHeight: 2246,
    });
  });

  it('maps checkbox strings: featured "" → false, visible "on" → true', () => {
    const item = makeItem({
      slug: 'cesde',
      title: { rendered: 'Cesde' },
      menu_order: 3,
      meta: { featured: '', visible: 'on' },
    });
    const result = wpProjectsSchema.safeParse([item]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const project = mapProject(result.data[0] as WPProject);
    expect(project.featured).toBe(false);
    expect(project.visible).toBe(true);
  });
});
