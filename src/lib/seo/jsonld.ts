import { siteInfo, type JsonLdObject, type FaqItemLd } from '../../constants';

/**
 * Pure JSON-LD builders (seo-complete-review). No side effects and no locale
 * lookups inside: callers pass translations in, so identical inputs always
 * produce identical output (spec `seo-jsonld`: typed, pure, testable builders).
 */

/** Person node with an in-page `@id` anchor used as the service's founder. */
export function buildPersonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteInfo.url}/#person`,
    name: siteInfo.name,
    jobTitle: siteInfo.jobTitle,
    url: siteInfo.url,
    telephone: siteInfo.telephone,
    image: siteInfo.logo,
    logo: siteInfo.logo,
    sameAs: [...siteInfo.sameAs],
  };
}

/** ProfessionalService advertising the site, tied to the same person via @id. */
export function buildProfessionalServiceLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteInfo.url}/#service`,
    name: siteInfo.name,
    url: siteInfo.url,
    image: siteInfo.logo,
    logo: siteInfo.logo,
    founder: { '@id': `${siteInfo.url}/#person` },
  };
}

/**
 * FAQPage node with one Question/Answer pair per item, text copied verbatim
 * from the SAME array FaqSection renders (UI/schema parity). Returns null for
 * an empty array so callers can skip emission safely.
 */
export function buildFaqPageLd(faq: FaqItemLd[], siteUrl: URL): JsonLdObject | null {
  if (faq.length === 0) {
    return null;
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl.toString().replace(/\/$/, '')}/#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * Combines the two nodes required on EVERY page (spec: Person +
 * ProfessionalService via BaseLayout). Keep in sync with the schema decision
 * in design.md AD-4.
 */
export function buildSiteJsonLd(): JsonLdObject[] {
  return [buildPersonLd(), buildProfessionalServiceLd()];
}

/**
 * Serializes one or more schema objects into one JSON string per object,
 * escaping `<` as `\u003c` (defense-in-depth against `</script>` breakout).
 * Returns an empty array for falsy/empty input (zero-object safe).
 */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[] | null): string[] {
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items.map((item) => JSON.stringify(item).replace(/</g, '\\u003c'));
}
