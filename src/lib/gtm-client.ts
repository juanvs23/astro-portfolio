import { buildDataLayerEvent, pushDataLayer, shouldLoadGtm } from './gtm';

declare global {
  interface Window {
    __gtmPush?: (name: string, payload?: Record<string, unknown>) => void;
  }
}

let initialized = false;

/**
 * Browser-side GTM wiring (gtm-integration, R2/R3/R6).
 *
 * Bundled via a `<script>` in BaseLayout. Guards double-init (View Transitions
 * may re-execute bundled scripts) and bails out entirely when
 * PUBLIC_GTM_CONTAINER_ID is empty — no listeners, no dataLayer, no bridge —
 * so an unconfigured env leaves zero GTM footprint (R1 empty scenario).
 *
 * Event model (design data flow):
 * - `astro:page-load` → `pageview` with the current path (R2)
 * - delegated `a[href*="wa.me"]` bubble listener:
 *     data-gtm-plan   → `plan_whatsapp_cta` { plan }  (R6)
 *     inside [data-wa-number] → skip (LeadForm, R3 exclusion)
 *     else            → `whatsapp_cta` (R3)
 * - `window.__gtmPush` bridge so LeadForm's inline (is:inline) handler reuses
 *   the same event builders (R4/R5).
 */
export function initGtmClient(): void {
  if (initialized) return;
  initialized = true;

  const containerId = import.meta.env.PUBLIC_GTM_CONTAINER_ID as string | undefined;
  if (!shouldLoadGtm(containerId)) return;

  document.addEventListener('astro:page-load', () => {
    pushDataLayer(buildDataLayerEvent('pageview', { page: window.location.pathname }));
  });

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target || typeof target.closest !== 'function') return;
    const link = target.closest('a[href*="wa.me"]') as HTMLAnchorElement | null;
    if (!link) return;

    const plan = link.dataset.gtmPlan;
    if (plan) {
      pushDataLayer(buildDataLayerEvent('plan_whatsapp_cta', { plan }));
      return;
    }

    // LeadForm's handler calls stopPropagation() so its CTA never reaches this
    // listener; the [data-wa-number] check is a defensive exclusion.
    if (link.closest('[data-wa-number]')) return;

    pushDataLayer(buildDataLayerEvent('whatsapp_cta'));
  });

  window.__gtmPush = (name, payload) => {
    pushDataLayer(buildDataLayerEvent(name, payload));
  };
}