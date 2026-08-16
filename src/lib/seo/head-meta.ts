import { locales, getLocalizedPathname, type Locale } from '../../i18n';

/**
 * Pure head-meta URL builders (seo-complete-review). All URLs derive from the
 * passed `siteUrl` (pages pass `Astro.site` from the `site` config) instead of
 * hardcoded domain strings — spec `seo-head-meta` Requirement: Site domain
 * configured and used for URLs.
 */

/** Absolute canonical URL for the current (locale-prefixed) pathname. */
export function buildCanonicalUrl(pathname: string, siteUrl: URL): string {
  return new URL(pathname, siteUrl).toString();
}

/**
 * Bidirectional hreflang alternates: one entry per locale, each pointing at
 * the localized equivalent (including the current locale). Both locales stay
 * prefixed (`/es/...` + `/en/...`) per `prefixDefaultLocale`; root paths
 * resolve to `/es` / `/en` — never a bare `/`.
 */
export function buildHreflangLinks(
  pathname: string,
  siteUrl: URL,
): Array<{ hreflang: Locale; href: string }> {
  return locales.map((locale) => ({
    hreflang: locale,
    href: new URL(getLocalizedPathname(pathname, locale), siteUrl).toString(),
  }));
}

/** Absolute URL of the per-locale OG asset (`/og-image-{es|en}.jpg`). */
export function resolveOgImageUrl(locale: Locale, siteUrl: URL): string {
  return new URL(`/og-image-${locale}.jpg`, siteUrl).toString();
}
