import { locales, getLocalizedPathname, type Locale } from '../../i18n';

/**
 * Pure sitemap builders (seo-complete-review, PR 2). All URLs derive from the
 * passed `baseUrl` (the route passes the `site` context / Astro.site, falling
 * back to the production domain when unset) instead of a hardcoded constant —
 * spec `seo-sitemap` Requirement: Base URL derived from Astro.site.
 */

/** Routes indexed per locale, including the previously missing services/automation pages. */
export const SITEMAP_PAGES = [
  '',
  '/about',
  '/skills',
  '/experience',
  '/projects',
  '/services',
  '/automation',
  '/contact',
] as const;

export interface SitemapAlternate {
  hreflang: Locale;
  href: string;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  alternates: SitemapAlternate[];
}

/**
 * Builds the full sitemap entry list: every page once per locale (`/es/...` +
 * `/en/...`), each with an absolute `loc`, today's `lastmod`, weekly/1.0 for
 * locale roots and monthly/0.8 otherwise, plus xhtml hreflang alternates for
 * both locale equivalents.
 */
export function buildSitemapEntries(baseUrl: URL, today: string): SitemapEntry[] {
  return locales.flatMap((locale) =>
    SITEMAP_PAGES.map((page) => {
      const pathname = `/${locale}${page}`;
      const hrefFor = (altLocale: Locale) =>
        new URL(getLocalizedPathname(pathname, altLocale), baseUrl).toString();

      return {
        loc: new URL(pathname, baseUrl).toString(),
        lastmod: today,
        changefreq: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? '1.0' : '0.8',
        alternates: locales.map((altLocale) => ({
          hreflang: altLocale,
          href: hrefFor(altLocale),
        })),
      } satisfies SitemapEntry;
    }),
  );
}

/**
 * Renders the sitemap document: a sitemaps.org urlset with the xhtml namespace
 * declared. Every url block keeps loc/lastmod/changefreq/priority and appends
 * the xhtml:link alternates after priority, per sitemaps.org + Google docs.
 */
export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const alternates = entry.alternates
      .map(
        (alt) =>
          `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`,
      )
      .join('\n');

    return [
      '  <url>',
      `    <loc>${entry.loc}</loc>`,
      `    <lastmod>${entry.lastmod}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      alternates,
      '  </url>',
    ].join('\n');
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
}
