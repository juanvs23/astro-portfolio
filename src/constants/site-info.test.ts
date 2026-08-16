import { describe, it, expect } from 'vitest';
import { siteInfo } from './site-info';
import { socialLinks } from './social-links';

// ---------------------------------------------------------------------------
// seo-complete-review PR 1 (1.1): site-info is the single source of truth for
// person/business identity used by every JSON-LD builder. The approved values
// come from spec `seo-jsonld` Requirement: site-info single source of truth.
// ---------------------------------------------------------------------------

describe('siteInfo identity', () => {
  it('should expose the approved name, jobTitle, url, telephone and logo', () => {
    expect(siteInfo.name).toBe('Juan Carlos Ávila');
    expect(siteInfo.jobTitle).toBe('Web Developer + AI Automation');
    expect(siteInfo.url).toBe('https://coltmandev.dev');
    expect(siteInfo.telephone).toBe('+58 424 831 0009');
    expect(siteInfo.logo).toBe('/favicon.svg');
  });

  it('should derive brandName from the person name for og:site_name', () => {
    expect(siteInfo.brandName).toBe('Juan Carlos Ávila');
    expect(siteInfo.brandName).not.toBe('');
  });

  it('should expose a twitterHandle for twitter:site', () => {
    expect(siteInfo.twitterHandle).toBe('@juanvs23');
  });
});

describe('siteInfo sameAs derivation', () => {
  it('should contain exactly the 4 hrefs from social-links.ts', () => {
    const expected = socialLinks.map((link) => link.href);
    expect(siteInfo.sameAs).toHaveLength(4);
    expect(siteInfo.sameAs).toEqual(expected);
  });

  it('should tie twitterHandle to the X social link (same @handle)', () => {
    const xLink = socialLinks.find((link) => link.name === 'X');
    expect(xLink).toBeDefined();
    const handleFromHref = xLink ? '@' + xLink.href.split('/').pop() : '';
    expect(siteInfo.twitterHandle).toBe(handleFromHref);
  });
});
