import { describe, it, expect, vi, afterEach } from 'vitest';
import { staggerDelay, onInView } from './viewport';

// ---------------------------------------------------------------------------
// home-visual-polish (PR 2 — animations): viewport reveal helpers. Motion's
// full package bundles inView/stagger at ~47KB gzip, over the 10KB budget, so
// the reveal TRIGGER is a small IntersectionObserver helper while the actual
// animation still runs on Motion One's `animate` from `motion/mini` (~5KB).
// `staggerDelay` is the pure stagger schedule; `onInView` wraps the observer.
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('staggerDelay', () => {
  it('starts at 0 for the first item with default step', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(1)).toBeCloseTo(0.08);
    expect(staggerDelay(2)).toBeCloseTo(0.16);
  });

  it('honors a custom step and start offset', () => {
    expect(staggerDelay(0, 0.22, 0.05)).toBeCloseTo(0.05);
    expect(staggerDelay(2, 0.22, 0.05)).toBeCloseTo(0.05 + 2 * 0.22);
  });
});

describe('onInView', () => {
  type IOFn = (
    callback: (entries: Array<{ isIntersecting: boolean; intersectionRatio: number }>) => void,
    options: unknown,
  ) => unknown;

  function stubIntersectionObserver() {
    const handlers: Array<(entries: Array<{ isIntersecting: boolean; intersectionRatio: number }>) => void> = [];
    let disconnected = 0;
    class FakeIntersectionObserver {
      constructor(handler: (entries: Array<{ isIntersecting: boolean; intersectionRatio: number }>) => void) {
        handlers.push(handler);
      }
      observe() {}
      unobserve() {}
      disconnect() {
        disconnected += 1;
        handlers.length = 0; // stop delivering entries, like the real observer
      }
    }
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    return {
      trigger(entries: Array<{ isIntersecting: boolean; intersectionRatio: number }>) {
        handlers.slice().forEach((h) => h(entries));
      },
      get disconnectCount() {
        return disconnected;
      },
    };
  }

  it('fires the callback when the element first intersects', () => {
    const io = stubIntersectionObserver();
    const el = {} as Element;
    const cb = vi.fn();
    onInView(el, cb);
    expect(cb).not.toHaveBeenCalled();
    io.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not fire for non-intersecting entries or below the ratio', () => {
    const io = stubIntersectionObserver();
    const el = {} as Element;
    const cb = vi.fn();
    onInView(el, cb);
    io.trigger([{ isIntersecting: false, intersectionRatio: 0 }]);
    io.trigger([{ isIntersecting: true, intersectionRatio: 0.05 }]);
    expect(cb).not.toHaveBeenCalled();
  });

  it('stops observing after one intersection (plays once)', () => {
    const io = stubIntersectionObserver();
    const el = {} as Element;
    const cb = vi.fn();
    onInView(el, cb);
    io.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
    io.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('stop() disconnects the observer and prevents further callbacks', () => {
    const io = stubIntersectionObserver();
    const el = {} as Element;
    const cb = vi.fn();
    const watcher = onInView(el, cb);
    watcher.stop();
    expect(io.disconnectCount).toBeGreaterThan(0);
    io.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
    expect(cb).not.toHaveBeenCalled();
  });
});
