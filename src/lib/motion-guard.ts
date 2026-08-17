/**
 * Motion guard — gates every Motion One animation on the site.
 *
 * `shouldEnableMotion` is the pure contract: any consumer passes the
 * `prefers-reduced-motion` flag and receives whether animations may run.
 * `prefersReducedMotion()` wraps `matchMedia` so browser code can feed the
 * pure function without repeating the media-query string. When the guard
 * returns false, CSS-only states (fully visible, static) take over and no
 * animation code path runs.
 */
export function shouldEnableMotion(prefersReduced: boolean): boolean {
  return !prefersReduced;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
