import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getProjects, resetProjectsCache } from './projects';
import { wpProjectsSchema } from './schema';

// ---------------------------------------------------------------------------
// Build-time projects data layer (Phase 2 of wordpress-headless):
// WP API fetch -> Zod validation -> map -> filter (visible && site) -> sort.
// On fetch throw / non-200 / schema failure: LOUD warning + committed snapshot.
// Tests stub fetch and the snapshot loader through the injectable deps.
// ---------------------------------------------------------------------------

const DEFAULT_ENDPOINT =
  'https://projects.coltmandev.dev/porfolio/wp-json/wp/v2/portafolio?_embed&orderby=menu_order&order=asc&per_page=100';

let nextId = 1;

/** WP item builder — trimmed to the schema contract, shaped like the live API. */
function wpItem(spec: {
  slug: string;
  order: number;
  showOn: 'portfolio' | 'sales' | 'both';
  visible?: boolean;
  featured?: boolean;
}): Record<string, unknown> {
  const visible = spec.visible ?? true;
  const featured = spec.featured ?? false;
  return {
    id: nextId++,
    slug: spec.slug,
    title: { rendered: spec.slug },
    menu_order: spec.order,
    meta: {
      desc_es: `Descripción ES de ${spec.slug}. Segunda frase.`,
      desc_en: `EN description of ${spec.slug}. Second sentence.`,
      url: `https://example.com/${spec.slug}/`,
      tech: '',
      show_on: spec.showOn,
      featured: featured ? 'on' : '',
      visible: visible ? 'on' : '',
      footnotes: '',
    },
    _embedded: {
      'wp:featuredmedia': [
        {
          id: nextId++,
          source_url: `https://projects.coltmandev.dev/porfolio/wp-content/uploads/${spec.slug}.jpg`,
          media_details: { width: 1920, height: 2246 },
        },
      ],
    },
  };
}

/** Minimal structural Response stub (what the data layer actually consumes). */
function jsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

const fourItemPayload = () => [
  wpItem({ slug: 'alpha', order: 5, showOn: 'portfolio' }),
  wpItem({ slug: 'bravo', order: 1, showOn: 'sales' }),
  wpItem({ slug: 'charlie', order: 3, showOn: 'both', featured: true }),
  wpItem({ slug: 'delta', order: 0, showOn: 'portfolio', visible: false }),
];

const SNAPSHOT_PATH = fileURLToPath(
  new URL('../../data/snapshot/projects.json', import.meta.url),
);

describe('getProjects — happy path', () => {
  beforeEach(() => {
    resetProjectsCache();
  });

  it('fetches the default endpoint, maps, filters and sorts for site=portfolio', async () => {
    const fetchStub = vi.fn(async (_url: string) => jsonResponse(fourItemPayload()));
    const projects = await getProjects('portfolio', { fetch: fetchStub });

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub.mock.calls[0][0]).toBe(DEFAULT_ENDPOINT);
    // portfolio site: alpha(5) + charlie(3), delta invisible, bravo sales-only.
    // Sorted by order: charlie(3) before alpha(5).
    expect(projects.map((p) => p.slug)).toEqual(['charlie', 'alpha']);
    expect(projects[0]).toMatchObject({
      slug: 'charlie',
      name: 'charlie',
      showOn: 'both',
      featured: true,
      visible: true,
      order: 3,
      imageWidth: 1920,
      imageHeight: 2246,
      url: 'https://example.com/charlie/',
      desc: {
        es: 'Descripción ES de charlie. Segunda frase.',
        en: 'EN description of charlie. Second sentence.',
      },
    });
  });

  it('filters sales|both for site=sales', async () => {
    const fetchStub = vi.fn(async () => jsonResponse(fourItemPayload()));
    const projects = await getProjects('sales', { fetch: fetchStub });
    expect(projects.map((p) => p.slug)).toEqual(['bravo', 'charlie']);
  });

  it('caches the fetch: a second section call does not refetch and filters per call', async () => {
    const fetchStub = vi.fn(async () => jsonResponse(fourItemPayload()));
    const first = await getProjects('portfolio', { fetch: fetchStub });
    const second = await getProjects('portfolio', { fetch: fetchStub });
    const sales = await getProjects('sales', { fetch: fetchStub });

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
    expect(sales.map((p) => p.slug)).toEqual(['bravo', 'charlie']);
  });
});

describe('getProjects — fallback to committed snapshot', () => {
  beforeEach(() => {
    resetProjectsCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetch rejects -> uses the committed snapshot via the default loader + LOUD warning', async () => {
    const fetchStub = vi.fn(async () => {
      throw new Error('network down');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const projects = await getProjects('portfolio', { fetch: fetchStub });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain(
      '[projects] WP API unreachable/invalid — falling back to committed snapshot',
    );
    // The committed snapshot is the real 18-item live payload — all visible
    // and show_on=portfolio in the current WP content.
    expect(projects).toHaveLength(18);
    expect(projects.some((p) => p.slug === 'gericht' && p.featured)).toBe(true);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it('fetch non-200 -> snapshot fallback via injected loader + warning', async () => {
    const fetchStub = vi.fn(async () => jsonResponse({ message: 'nope' }, 503));
    const loadSnapshot = vi.fn(async () => [
      wpItem({ slug: 'snap-only', order: 1, showOn: 'portfolio' }),
    ]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const projects = await getProjects('portfolio', { fetch: fetchStub, loadSnapshot });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(loadSnapshot).toHaveBeenCalledTimes(1);
    expect(projects.map((p) => p.slug)).toEqual(['snap-only']);
  });

  it('fetch 200 but schema-invalid payload -> snapshot fallback + warning', async () => {
    const fetchStub = vi.fn(async () => jsonResponse([{ slug: 'broken-item' }]));
    const loadSnapshot = vi.fn(async () => [
      wpItem({ slug: 'snap-only', order: 1, showOn: 'both' }),
    ]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const projects = await getProjects('sales', { fetch: fetchStub, loadSnapshot });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(projects.map((p) => p.slug)).toEqual(['snap-only']);
  });

  it('fetch 200 but EMPTY payload -> snapshot fallback + warning (never silently render an empty page)', async () => {
    const fetchStub = vi.fn(async () => jsonResponse([]));
    const loadSnapshot = vi.fn(async () => [
      wpItem({ slug: 'snap-only', order: 1, showOn: 'portfolio' }),
    ]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const projects = await getProjects('portfolio', { fetch: fetchStub, loadSnapshot });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(projects.map((p) => p.slug)).toEqual(['snap-only']);
  });
});

describe('getProjects — no data source available', () => {
  beforeEach(() => {
    resetProjectsCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetch rejects AND snapshot loader rejects -> throws a LOUD error', async () => {
    const fetchStub = vi.fn(async () => {
      throw new Error('network down');
    });
    const loadSnapshot = vi.fn(async () => {
      throw new Error('snapshot missing');
    });

    await expect(
      getProjects('portfolio', { fetch: fetchStub, loadSnapshot }),
    ).rejects.toThrow(
      /WP API unreachable\/invalid AND the committed snapshot failed/,
    );
  });

  it('fetch rejects AND snapshot loader returns schema-invalid data -> throws', async () => {
    const fetchStub = vi.fn(async () => {
      throw new Error('network down');
    });
    const loadSnapshot = vi.fn(async () => [{ slug: 'corrupt-snapshot' }]);

    await expect(
      getProjects('portfolio', { fetch: fetchStub, loadSnapshot }),
    ).rejects.toThrow(/committed snapshot failed/);
  });
});

describe('committed snapshot integrity', () => {
  it('validates against the WP schema (18 real items from the live API)', () => {
    const snapshot: unknown = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
    const result = wpProjectsSchema.safeParse(snapshot);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(18);
    }
  });
});
