import { socialLinks } from './social-links';

/**
 * Single source of truth for person/business identity used by all JSON-LD
 * builders and head metadata (seo-complete-review). No other module MAY
 * hardcode this identity data — import from here instead.
 *
 * `sameAs` is derived from `social-links.ts` (GitHub, LinkedIn, X, Facebook)
 * so the structured data can never drift from the rendered social links.
 */
export const siteInfo = {
  name: 'Juan Carlos Ávila',
  jobTitle: 'Web Developer + AI Automation',
  url: 'https://coltmandev.dev',
  telephone: '+58 424 831 0009',
  logo: '/favicon.svg',
  brandName: 'Juan Carlos Ávila',
  twitterHandle: '@juanvs23',
  sameAs: socialLinks.map((link) => link.href),
} as const;

/** A schema.org JSON-LD object with the context preserved on every node. */
export interface JsonLdObject {
  '@context': 'https://schema.org';
  [key: string]: unknown;
}

/** Minimal FAQ item shape consumed by the FAQPage builder. */
export interface FaqItemLd {
  question: string;
  answer: string;
}
