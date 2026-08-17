import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { staggerDelay, onInView, onScrollEnd } from './viewport';

// ---------------------------------------------------------------------------
// home-visual-polish (PR 2 — animations): viewport reveal helpers. Motion's
// full package bundles inView/stagger at ~47KB gzip, over the 10KB budget, so
// the reveal TRIGGER is a small helper while the actual animation still runs
// on Motion One's `animate` from `motion/mini` (~5KB). `staggerDelay` is the
// pure stagger schedule; `onInView` wraps an IntersectionObserver (fires the
// instant the element crosses the threshold); `onScrollEnd` (approved home
// behavior) delays the reveal until the user stops scrolling.
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubWindowScroll() {
  const listeners: Record<string, EventListener[]> = {};
  vi.stubGlobal('window', {
    innerHeight: 800,
    documentElement: { clientHeight: 800 },
    addEventListener: (type: string, fn: EventListener) => {
      (listeners[type] ??= []).push(fn);
    },
    removeEventListener: (type: string, fn: EventListener) => {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
  });
  return {
    fire(type: string) {
      (listeners[type] ?? []).forEach((fn) => fn(new Event(type)));
    },
    has(type: string) {
      return (listeners[type] ?? []).length > 0;
    },
  };
}

function fakeElement(top: number, height = 200): Element {
  return {
    getBoundingClientRect: () => ({
      top,
      bottom: top + height,
      height,
      width: 100,
      left: 0,
      right: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }),
  } as unknown as Element;
}

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

describe('onScrollEnd', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires immediately when the element is already visible', () => {
    stubWindowScroll();
    const cb = vi.fn();
    onScrollEnd(fakeElement(200), cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not fire while the element is below the fold during scroll', () => {
    const win = stubWindowScroll();
    const cb = vi.fn();
    // element at top=4000 (below viewport 800) — not visible
    onScrollEnd(fakeElement(4000), cb);
    win.fire('scroll');
    vi.advanceTimersByTime(200);
    expect(cb).not.toHaveBeenCalled();
  });

  it('fires only after the scroll settles (debounced) once the element becomes visible', () => {
    const win = stubWindowScroll();
    const cb = vi.fn();
    // start below fold
    const el = fakeElement(4000);
    onScrollEnd(el, cb);
    // user scrolls but the element is STILL below the fold → no fire
    win.fire('scroll');
    vi.advanceTimersByTime(200);
    expect(cb).not.toHaveBeenCalled();
    // now the element enters the viewport mid-scroll: the callback must NOT
    // fire immediately — it waits for the debounce window to settle
    const visible = fakeElement(400);
    Object.assign(el, visible);
    win.fire('scroll');
    expect(cb).not.toHaveBeenCalled();
    // after the debounce window with no further scroll → fires once
    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);
    // and it never fires again
    win.fire('scroll');
    vi.advanceTimersByTime(300);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('stop() removes listeners and prevents later callbacks', () => {
    const win = stubWindowScroll();
    const cb = vi.fn();
    const watcher = onScrollEnd(fakeElement(4000), cb);
    watcher.stop();
    win.fire('scroll');
    vi.advanceTimersByTime(300);
    expect(cb).not.toHaveBeenCalled();
  });
});
