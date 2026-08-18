import { describe, it, expect, vi, afterEach } from 'vitest';
import { shouldLoadGtm, buildDataLayerEvent, pushDataLayer } from './gtm';

// ---------------------------------------------------------------------------
// gtm-integration: the pure GTM helper contract (spec R7, R8). `shouldLoadGtm`
// decides whether GTM may load from the env container id; `buildDataLayerEvent`
// shapes dataLayer events; `pushDataLayer` is the thin DOM wrapper guarding
// `window.dataLayer`. The first two are pure (node-testable); the third stubs
// the window global exactly like motion-guard.test.ts stubs matchMedia.
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('shouldLoadGtm', () => {
  it('returns false for an empty container id', () => {
    expect(shouldLoadGtm('')).toBe(false);
  });

  it('returns false when no container id is provided', () => {
    expect(shouldLoadGtm(undefined)).toBe(false);
  });

  it('returns true for a non-empty container id', () => {
    expect(shouldLoadGtm('GTM-ABC123')).toBe(true);
  });

  it('returns true for a second non-empty container id (different value)', () => {
    expect(shouldLoadGtm('GTM-XYZ789')).toBe(true);
  });
});

describe('buildDataLayerEvent', () => {
  it('merges the event name with the payload', () => {
    expect(buildDataLayerEvent('pageview', { page: '/es' })).toEqual({
      event: 'pageview',
      page: '/es',
    });
  });

  it('keeps extra payload keys alongside the event name', () => {
    expect(buildDataLayerEvent('plan_whatsapp_cta', { plan: 'ecommerce' })).toEqual({
      event: 'plan_whatsapp_cta',
      plan: 'ecommerce',
    });
  });

  it('returns only the event name when no payload is given', () => {
    expect(buildDataLayerEvent('whatsapp_cta')).toEqual({ event: 'whatsapp_cta' });
  });
});

describe('pushDataLayer', () => {
  it('creates window.dataLayer when missing and pushes the event', () => {
    vi.stubGlobal('window', {});
    pushDataLayer({ event: 'pageview', page: '/es' });
    const w = window as unknown as { dataLayer: unknown[] };
    expect(Array.isArray(w.dataLayer)).toBe(true);
    expect(w.dataLayer).toEqual([{ event: 'pageview', page: '/es' }]);
  });

  it('appends to an existing window.dataLayer', () => {
    vi.stubGlobal('window', { dataLayer: [{ event: 'gtm.js' }] });
    pushDataLayer({ event: 'whatsapp_cta' });
    const w = window as unknown as { dataLayer: unknown[] };
    expect(w.dataLayer).toHaveLength(2);
    expect(w.dataLayer[1]).toEqual({ event: 'whatsapp_cta' });
  });

  it('is a no-op in environments without a global window (SSR)', () => {
    expect(() => pushDataLayer({ event: 'pageview' })).not.toThrow();
  });
});