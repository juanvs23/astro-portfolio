import { describe, it, expect, expectTypeOf } from 'vitest';
import { SiteInfoSchema, type SiteInfo } from './site-info.js';

const validSiteInfo = {
  id: 'site_01',
  name: 'Juan Carlos Ávila',
  jobTitle: 'Web Developer + AI Automation',
  url: 'https://coltmandev.dev',
  telephone: '+58 424 831 0009',
  logo: '/favicon.svg',
  brandName: 'Juan Carlos Ávila',
  twitterHandle: '@juanvs23',
  sameAs: ['https://github.com/juanvs23', 'https://x.com/juanvs23'],
} as const;

describe('SiteInfoSchema', () => {
  it('parses a valid site info doc', () => {
    const result = SiteInfoSchema.safeParse(validSiteInfo);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Juan Carlos Ávila');
      expect(result.data.sameAs).toHaveLength(2);
      expect(result.data.jobTitle).toBe('Web Developer + AI Automation');
    }
  });

  it('rejects site info missing brandName', () => {
    const { brandName: _dropped, ...missing } = validSiteInfo;
    const result = SiteInfoSchema.safeParse(missing);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('brandName');
    }
  });

  it('rejects sameAs when it is not an array of strings', () => {
    const result = SiteInfoSchema.safeParse({ ...validSiteInfo, sameAs: 'not-an-array' });
    expect(result.success).toBe(false);
  });

  it('rejects sameAs containing a non-string element', () => {
    const result = SiteInfoSchema.safeParse({ ...validSiteInfo, sameAs: [42] });
    expect(result.success).toBe(false);
  });

  it('infers a SiteInfo type equal to the parsed output', () => {
    const parsed = SiteInfoSchema.parse(validSiteInfo);
    expectTypeOf(parsed).toEqualTypeOf<SiteInfo>();
    expect(parsed.url).toBe('https://coltmandev.dev');
  });
});