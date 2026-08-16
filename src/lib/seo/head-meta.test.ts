import { describe, it, expect } from 'vitest';
import { buildCanonicalUrl, buildHreflangLinks, resolveOgImageUrl } from './head-meta';

// ---------------------------------------------------------------------------
// seo-complete-review PR 1 (1.6): pure head-meta URL builders. Expected URLs
// come from spec `seo-head-meta` (Requirement: Site domain configured and
// used for URLs; Bidirectional hreflang alternates; Per-locale og:image).
// ---------------------------------------------------------------------------

const SITE_URL = new URL('https://coltmandev.dev');

describe('buildCanonicalUrl', () => {
  it('should build the absolute canonical URL for an es page', () => {
    expect(buildCanonicalUrl('/es/services', SITE_URL)).toBe('https://coltmandev.dev/es/services');
  });

  it('should build the absolute canonical URL for an en page', () => {
    expect(buildCanonicalUrl('/en/about', SITE_URL)).toBe('https://coltmandev.dev/en/about');
  });
});

describe('buildHreflangLinks', () => {
  it('should return es and en alternates for an es page, both locale-prefixed', () => {
    expect(buildHreflangLinks('/es/services', SITE_URL)).toEqual([
      { hreflang: 'es', href: 'https://coltmandev.dev/es/services' },
      { hreflang: 'en', href: 'https://coltmandev.dev/en/services' },
    ]);
  });

  it('should return es and en alternates for an en page', () => {
    expect(buildHreflangLinks('/en/about', SITE_URL)).toEqual([
      { hreflang: 'es', href: 'https://coltmandev.dev/es/about' },
      { hreflang: 'en', href: 'https://coltmandev.dev/en/about' },
    ]);
  });

  it('should point root paths at the prefixed locale roots with no bare slash', () => {
    const hrefs = buildHreflangLinks('/es', SITE_URL).map((link) => link.href);
    expect(hrefs).toEqual(['https://coltmandev.dev/es', 'https://coltmandev.dev/en']);
  });
});

describe('resolveOgImageUrl', () => {
  it('should resolve the es og asset for the es locale', () => {
    expect(resolveOgImageUrl('es', SITE_URL)).toBe('https://coltmandev.dev/og-image-es.jpg');
  });

  it('should resolve the en og asset for the en locale', () => {
    expect(resolveOgImageUrl('en', SITE_URL)).toBe('https://coltmandev.dev/og-image-en.jpg');
  });
});
