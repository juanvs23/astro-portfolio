/**
 * GTM analytics helpers (gtm-integration).
 *
 * `shouldLoadGtm` and `buildDataLayerEvent` are the pure contract —
 * node-testable with no DOM (spec R7). `pushDataLayer` is the thin browser
 * wrapper that guards `window.dataLayer`, creating the array when the GTM
 * loader snippet has not run yet. Mirrors the `motion-guard.ts`
 * pure-contract + DOM-wrapper split.
 */
export function shouldLoadGtm(containerId?: string): boolean {
  return Boolean(containerId);
}

export function buildDataLayerEvent(
  name: string,
  payload?: Record<string, unknown>,
): Record<string, unknown> {
  return { event: name, ...payload };
}

export function pushDataLayer(event: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: unknown[] };
  if (!Array.isArray(w.dataLayer)) {
    w.dataLayer = [];
  }
  w.dataLayer.push(event);
}