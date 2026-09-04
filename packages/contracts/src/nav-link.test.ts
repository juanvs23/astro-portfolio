import { describe, it, expect, expectTypeOf } from 'vitest';
import { NavLinkSchema, type NavLink } from './nav-link.js';

const validNavLink = {
  id: 'nav_01',
  key: 'menu.about',
  path: '/about',
  order: 1,
  visible: true,
} as const;

describe('NavLinkSchema', () => {
  it('parses a valid nav link', () => {
    const result = NavLinkSchema.safeParse(validNavLink);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.key).toBe('menu.about');
      expect(result.data.path).toBe('/about');
    }
  });

  it('rejects a nav link missing path', () => {
    const { path: _dropped, ...missing } = validNavLink;
    const result = NavLinkSchema.safeParse(missing);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('path');
    }
  });

  it('rejects a nav link with a non-boolean visible', () => {
    const result = NavLinkSchema.safeParse({ ...validNavLink, visible: 1 });
    expect(result.success).toBe(false);
  });

  it('infers a NavLink type equal to the parsed output', () => {
    const parsed = NavLinkSchema.parse(validNavLink);
    expectTypeOf(parsed).toEqualTypeOf<NavLink>();
    expect(parsed.order).toBe(1);
  });
});