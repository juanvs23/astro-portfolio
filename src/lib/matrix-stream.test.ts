import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildLateralStreams,
  createMatrixStream,
  MIN_STREAM_LENGTH,
  MAX_STREAM_LENGTH,
  type LateralStream,
} from './matrix-stream';

// ---------------------------------------------------------------------------
// home-visual-polish (PR 3 — hero): lateral matrix stream. `buildLateralStreams`
// is the pure config helper (one stream per canvas row, horizontal cells,
// speed in chars/sec within the typewriter cadence range, length bounded);
// `createMatrixStream` drives a canvas 2D RAF loop and respects
// prefers-reduced-motion with a single static faint grid (no loop).
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildLateralStreams', () => {
  it('returns one stream per row with bounded speed, length and column', () => {
    const streams = buildLateralStreams(8, 60, 14, 33);
    expect(streams).toHaveLength(8);
    for (const s of streams) {
      expect(s.speed).toBeGreaterThanOrEqual(14);
      expect(s.speed).toBeLessThanOrEqual(33);
      expect(s.len).toBeGreaterThanOrEqual(MIN_STREAM_LENGTH);
      expect(s.len).toBeLessThanOrEqual(MAX_STREAM_LENGTH);
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThan(60);
    }
  });

  it('returns an empty list when rows is 0', () => {
    expect(buildLateralStreams(0, 60, 14, 33)).toEqual([]);
  });

  it('produces streams with a non-trivial speed spread (not all identical)', () => {
    const streams = buildLateralStreams(40, 60, 14, 33);
    const speeds = new Set(streams.map((s) => s.speed));
    expect(speeds.size).toBeGreaterThan(1);
  });

  it('locks every speed to the single value when min equals max', () => {
    const streams = buildLateralStreams(4, 30, 20, 20);
    expect(streams.every((s) => s.speed === 20)).toBe(true);
  });

  it('swaps an inverted speed range instead of producing broken values', () => {
    const streams = buildLateralStreams(10, 30, 33, 14);
    for (const s of streams) {
      expect(s.speed).toBeGreaterThanOrEqual(14);
      expect(s.speed).toBeLessThanOrEqual(33);
    }
  });

  it('keeps the starting column inside a single-column grid', () => {
    const streams = buildLateralStreams(4, 1, 14, 33);
    expect(streams.every((s) => s.x === 0)).toBe(true);
  });
});

describe('createMatrixStream', () => {
  type FrameCallback = (t: number) => void;

  function makeFakeCanvas(width = 640, height = 320) {
    const calls: string[] = [];
    const ctx = {
      font: '',
      fillStyle: '',
      fillText: () => {
        calls.push('fillText');
      },
      clearRect: () => {
        calls.push('clearRect');
      },
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: (kind: string) => (kind === '2d' ? ctx : null),
      getBoundingClientRect: () => ({ width, height }),
    };
    return { canvas, ctx, calls };
  }

  function stubRaf() {
    const queue: FrameCallback[] = [];
    let cancelled = 0;
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameCallback) => {
      queue.push(cb);
      return ++id;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {
      cancelled += 1;
    });
    return {
      queue,
      get cancelled() {
        return cancelled;
      },
      step(t: number) {
        const cb = queue.shift();
        if (cb) cb(t);
      },
    };
  }

  it('start() runs an animation loop and stop() cancels it', () => {
    const raf = stubRaf();
    const { canvas } = makeFakeCanvas();
    const stream = createMatrixStream(canvas as unknown as HTMLCanvasElement, {});
    stream.start();
    expect(raf.queue.length).toBe(1);
    stream.stop();
    expect(raf.cancelled).toBe(1);
  });

  it('an animated frame draws glyphs and schedules the next frame', () => {
    const raf = stubRaf();
    const { canvas, calls } = makeFakeCanvas(640, 320);
    const stream = createMatrixStream(canvas as unknown as HTMLCanvasElement, {});
    stream.start();
    raf.step(16.6);
    const fillCalls = calls.filter((c) => c === 'fillText').length;
    expect(fillCalls).toBeGreaterThan(0);
    expect(raf.queue.length).toBe(1);
  });

  it('does not loop and never starts again after stop()', () => {
    const raf = stubRaf();
    const { canvas } = makeFakeCanvas();
    const stream = createMatrixStream(canvas as unknown as HTMLCanvasElement, {});
    stream.start();
    stream.stop();
    const queueLengthAfterStop = raf.queue.length;
    stream.start();
    expect(raf.queue.length).toBe(queueLengthAfterStop + 1);
  });

  it('renders a static faint grid without any loop under reduced motion', () => {
    const raf = stubRaf();
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: true }),
    });
    const { canvas, calls } = makeFakeCanvas(640, 320);
    const stream = createMatrixStream(canvas as unknown as HTMLCanvasElement, {});
    stream.start();
    expect(raf.queue.length).toBe(0);
    expect(calls.filter((c) => c === 'fillText').length).toBeGreaterThan(0);
  });
});
