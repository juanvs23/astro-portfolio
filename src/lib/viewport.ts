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

/**
 * Fires `callback` once when `element` is visible at the given ratio AND the
 * user has stopped scrolling (debounced ~140ms after the last scroll event).
 *
 * Unlike `onInView` (IntersectionObserver, fires the instant the element
 * crosses the threshold while the user is mid-scroll), this delays the reveal
 * until the scroll settles so the entrance animations never compete with an
 * in-flight scroll — the approved home behavior for data-reveal/terminal
 * animations. Falls back to the `scrollend` event when supported, otherwise a
 * trailing debounce. Returns a watcher whose `stop()` removes listeners.
 */
export function onScrollEnd(
  element: Element,
  callback: () => void,
  options: ViewportWatchOptions = {},
): ViewportWatcher {
  const amount = options.amount ?? 0.2;
  let fired = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let scrollEndHandler: (() => void) | null = null;

  function isVisible(): boolean {
    const rect = element.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.height <= 0) return false;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    return visible > 0 && visible / rect.height >= amount;
  }

  function fire() {
    if (fired) return;
    fired = true;
    cleanup();
    callback();
  }

  function checkAfterScroll() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (isVisible()) fire();
    }, 140);
  }

  function cleanup() {
    window.removeEventListener('scroll', checkAfterScroll, { passive: true } as AddEventListenerOptions);
    window.removeEventListener('resize', checkAfterScroll);
    window.removeEventListener('scrollend', fire as EventListener);
    if (timer) clearTimeout(timer);
  }

  if (typeof window === 'undefined') {
    return { stop() {} };
  }

  // scrollend (supported in modern browsers) fires after the scroll finishes;
  // the trailing debounce covers older engines. Both are removed after fire.
  if ('onscrollend' in window) {
    scrollEndHandler = () => {
      if (isVisible()) fire();
    };
    window.addEventListener('scrollend', scrollEndHandler as EventListener);
  }
  window.addEventListener('scroll', checkAfterScroll, { passive: true } as AddEventListenerOptions);
  window.addEventListener('resize', checkAfterScroll);

  // Initial position: if already visible with no scroll in progress, reveal.
  if (isVisible()) fire();

  return {
    stop: cleanup,
  };
}
