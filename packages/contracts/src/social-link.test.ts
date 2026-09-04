import { describe, it, expect, expectTypeOf } from 'vitest';
import { SocialLinkSchema, type SocialLink } from './social-link.js';

const validSocialLink = {
  id: 'soc_01',
  name: 'GitHub',
  href: 'https://github.com/juanvs23',
  icon: 'github',
  order: 0,
  visible: true,
} as const;

describe('SocialLinkSchema', () => {
  it('parses a valid social link', () => {
    const result = SocialLinkSchema.safeParse(validSocialLink);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('GitHub');
      expect(result.data.href).toBe('https://github.com/juanvs23');
    }
  });

  it('rejects a social link missing href', () => {
    const { href: _dropped, ...missing } = validSocialLink;
    const result = SocialLinkSchema.safeParse(missing);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('href');
    }
  });

  it('rejects a social link with a non-string icon', () => {
    const result = SocialLinkSchema.safeParse({ ...validSocialLink, icon: 7 });
    expect(result.success).toBe(false);
  });

  it('infers a SocialLink type equal to the parsed output', () => {
    const parsed = SocialLinkSchema.parse(validSocialLink);
    expectTypeOf(parsed).toEqualTypeOf<SocialLink>();
    expect(parsed.icon).toBe('github');
  });
});