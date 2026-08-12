import { describe, it, expect, vi, afterEach } from 'vitest';
import { shouldEnableMotion, prefersReducedMotion } from './motion-guard';

// ---------------------------------------------------------------------------
// home-visual-polish (PR 2 — animations): the motion guard gates every Motion
// One animation (scroll reveals, CTA pulse, hero chain). The pure contract is
// `shouldEnableMotion(prefersReduced)`; `prefersReducedMotion()` is the
// matchMedia wrapper that feeds it. When the guard returns false, all animated
// content renders static and fully visible (CSS-only states).
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('shouldEnableMotion', () => {
  it('returns false when the user prefers reduced motion', () => {
    expect(shouldEnableMotion(true)).toBe(false);
  });

  it('returns true when the user does not prefer reduced motion', () => {
    expect(shouldEnableMotion(false)).toBe(true);
  });
});

describe('prefersReducedMotion', () => {
  it('returns false in environments without matchMedia (SSR / node)', () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns true when the browser reports reduced motion', () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: true }),
    });
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when the browser does not report reduced motion', () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });
    expect(prefersReducedMotion()).toBe(false);
  });
});
