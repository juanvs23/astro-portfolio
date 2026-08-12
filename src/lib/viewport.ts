/**
 * Viewport reveal helpers for the Motion One reveal lifecycle.
 *
 * Motion's full package bundles `inView`/`stagger` at ~47KB gzip, which blows
 * the 10KB animation-runtime budget. The reveal TRIGGER therefore lives here
 * as a tiny IntersectionObserver wrapper plus a pure stagger schedule; the
 * actual animation still runs on Motion One's `animate` from `motion/mini`
 * (~5KB gzip). This is a trigger, not a second animation system.
 */

export function staggerDelay(index: number, step = 0.08, start = 0): number {
  return start + index * step;
}

export interface ViewportWatcher {
  stop(): void;
}

export interface ViewportWatchOptions {
  /** Intersection ratio (0..1) required before the callback fires. */
  amount?: number;
}

/**
 * Fires `callback` once when `element` first intersects at the given ratio,
 * then stops observing — the AOS `once: true` equivalent. Returns a watcher
 * whose `stop()` removes the observation early (used by `astro:before-swap`).
 */
export function onInView(
  element: Element,
  callback: () => void,
  options: ViewportWatchOptions = {},
): ViewportWatcher {
  const amount = options.amount ?? 0.2;

  if (typeof IntersectionObserver === 'undefined') {
    callback();
    return { stop() {} };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= amount) {
          observer.disconnect();
          callback();
          return;
        }
      }
    },
    { threshold: amount },
  );

  observer.observe(element);

  return {
    stop() {
      observer.disconnect();
    },
  };
}
