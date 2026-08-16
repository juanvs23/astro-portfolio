import { describe, it, expect } from 'vitest';
import {
  SITEMAP_PAGES,
  buildSitemapEntries,
  renderSitemapXml,
  type SitemapEntry,
} from './sitemap';

// ---------------------------------------------------------------------------
// seo-complete-review (PR 2 — sitemap): pure sitemap builders.
// `buildSitemapEntries` derives every URL from the passed `baseUrl` (the route
// passes the `site` context / Astro.site) so no hardcoded domain is used, and
// `renderSitemapXml` keeps sitemaps.org fields (lastmod/changefreq/priority)
// while appending xhtml:link hreflang alternates — spec `seo-sitemap`.
// ---------------------------------------------------------------------------

const BASE_URL = new URL('https://coltmandev.dev');
const TODAY = '2026-08-15';

const EXPECTED_PAGES = ['', '/about', '/skills', '/experience', '/projects', '/services', '/automation', '/contact'];

describe('SITEMAP_PAGES', () => {
  it('covers the 8 routes including /services and /automation', () => {
    expect(SITEMAP_PAGES).toEqual(EXPECTED_PAGES);
  });
});

describe('buildSitemapEntries', () => {
  it('emits 16 entries (8 pages × 2 locales), each with lastmod set to today', () => {
    const entries = buildSitemapEntries(BASE_URL, TODAY);
    expect(entries).toHaveLength(16);
    expect(entries.every((entry) => entry.lastmod === TODAY)).toBe(true);
  });

  it('indexes /es/services, /en/services, /es/automation and /en/automation', () => {
    const locs = buildSitemapEntries(BASE_URL, TODAY).map((entry) => entry.loc);
    expect(locs).toContain('https://coltmandev.dev/es/services');
    expect(locs).toContain('https://coltmandev.dev/en/services');
    expect(locs).toContain('https://coltmandev.dev/es/automation');
    expect(locs).toContain('https://coltmandev.dev/en/automation');
  });

  it('emits every page under both /es and /en prefixes', () => {
    const locs = buildSitemapEntries(BASE_URL, TODAY).map((entry) => entry.loc);
    for (const page of EXPECTED_PAGES) {
      const path = page === '' ? '' : page;
      expect(locs).toContain(`https://coltmandev.dev/es${path}`);
      expect(locs).toContain(`https://coltmandev.dev/en${path}`);
    }
  });

  it('derives locs from the passed base URL instead of a hardcoded domain', () => {
    const locs = buildSitemapEntries(new URL('https://example.com'), TODAY).map((entry) => entry.loc);
    expect(locs.every((loc) => loc.startsWith('https://example.com'))).toBe(true);
    expect(locs.some((loc) => loc.includes('coltmandev'))).toBe(false);
  });

  it('marks locale roots weekly/1.0 and the rest monthly/0.8', () => {
    const entries = buildSitemapEntries(BASE_URL, TODAY);
    const rootEs = entries.find((entry) => entry.loc === 'https://coltmandev.dev/es');
    const rootEn = entries.find((entry) => entry.loc === 'https://coltmandev.dev/en');
    const servicesEs = entries.find((entry) => entry.loc === 'https://coltmandev.dev/es/services');
    const aboutEn = entries.find((entry) => entry.loc === 'https://coltmandev.dev/en/about');

    expect(rootEs?.changefreq).toBe('weekly');
    expect(rootEs?.priority).toBe('1.0');
    expect(rootEn?.changefreq).toBe('weekly');
    expect(rootEn?.priority).toBe('1.0');
    expect(servicesEs?.changefreq).toBe('monthly');
    expect(servicesEs?.priority).toBe('0.8');
    expect(aboutEn?.changefreq).toBe('monthly');
    expect(aboutEn?.priority).toBe('0.8');
  });

  it('gives every entry exactly two alternates: its own locale and the other one', () => {
    const entries = buildSitemapEntries(BASE_URL, TODAY);
    for (const entry of entries) {
      expect(entry.alternates).toHaveLength(2);
      const langs = entry.alternates.map((alt) => alt.hreflang).sort();
      expect(langs).toEqual(['en', 'es']);
    }
  });

  it('points the /es/automation alternates at /es/automation and /en/automation', () => {
    const esAutomation = buildSitemapEntries(BASE_URL, TODAY).find(
      (entry) => entry.loc === 'https://coltmandev.dev/es/automation',
    );
    expect(esAutomation?.alternates).toEqual([
      { hreflang: 'es', href: 'https://coltmandev.dev/es/automation' },
      { hreflang: 'en', href: 'https://coltmandev.dev/en/automation' },
    ]);
  });

  it('points root alternates at /es and /en (no bare slash)', () => {
    const esRoot = buildSitemapEntries(BASE_URL, TODAY).find(
      (entry) => entry.loc === 'https://coltmandev.dev/es',
    );
    expect(esRoot?.alternates.map((alt) => alt.href)).toEqual([
      'https://coltmandev.dev/es',
      'https://coltmandev.dev/en',
    ]);
  });
});

describe('renderSitemapXml', () => {
  const xml = renderSitemapXml(buildSitemapEntries(BASE_URL, TODAY));

  it('renders a urlset document with sitemaps.org and xhtml namespaces', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.trim().endsWith('</urlset>')).toBe(true);
  });

  it('keeps one url block with loc, lastmod, changefreq and priority per entry', () => {
    expect((xml.match(/<url>/g) ?? []).length).toBe(16);
    expect((xml.match(/<loc>/g) ?? []).length).toBe(16);
    expect((xml.match(/<lastmod>/g) ?? []).length).toBe(16);
    expect((xml.match(/<changefreq>/g) ?? []).length).toBe(16);
    expect((xml.match(/<priority>/g) ?? []).length).toBe(16);
  });

  it('emits two xhtml:link alternates per url block (32 total)', () => {
    expect((xml.match(/<xhtml:link/g) ?? []).length).toBe(32);
    expect((xml.match(/hreflang="es"/g) ?? []).length).toBe(16);
    expect((xml.match(/hreflang="en"/g) ?? []).length).toBe(16);
  });

  it('places alternates inside the automation url block, after priority', () => {
    const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    const automationBlock = blocks.find((block) =>
      block.includes('<loc>https://coltmandev.dev/es/automation</loc>'),
    );
    expect(automationBlock).toBeDefined();
    const priorityAt = automationBlock!.indexOf('<priority>');
    const alternateAt = automationBlock!.indexOf('<xhtml:link');
    expect(priorityAt).toBeGreaterThan(-1);
    expect(alternateAt).toBeGreaterThan(priorityAt);
    expect(automationBlock).toContain('hreflang="es" href="https://coltmandev.dev/es/automation"');
    expect(automationBlock).toContain('hreflang="en" href="https://coltmandev.dev/en/automation"');
  });

  it('keeps every loc and alternate href absolute under the configured site', () => {
    const locs = xml.match(/<loc>(.*?)<\/loc>/g) ?? [];
    expect(locs).toHaveLength(16);
    expect(locs.every((loc) => loc.includes('https://coltmandev.dev/'))).toBe(true);
  });
});
