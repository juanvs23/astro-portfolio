import { prefersReducedMotion } from './motion-guard';

/**
 * Lateral matrix stream — native canvas 2D, no WebGL, no dependency (~5KB).
 * Monospaced glyph rows flow horizontally (left → right) across the hero,
 * each stream moving at a speed within the typewriter cadence range
 * (~14–33 chars/s). The canvas is decorative (aria-hidden) and, under
 * prefers-reduced-motion, renders a single static faint glyph grid with no
 * animation loop.
 */

export const DEFAULT_GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF#$%+*';
export const DEFAULT_SPEED_MIN = 14;
export const DEFAULT_SPEED_MAX = 33;
export const DEFAULT_FONT_SIZE = 16;
export const MIN_STREAM_LENGTH = 6;
export const MAX_STREAM_LENGTH = 16;

export interface MatrixStreamOptions {
  glyphs?: string;
  fontSize?: number;
  /** chars/second range; defaults to the typewriter cadence 14–33. */
  speedMin?: number;
  speedMax?: number;
}

export interface LateralStream {
  /** current head column (float; advances with speed * dt). */
  x: number;
  /** chars/second. */
  speed: number;
  /** trail length in characters. */
  len: number;
}

export interface MatrixStream {
  start(): void;
  stop(): void;
}

/** Random integer in [min, max], tolerant of an inverted range. */
export function randomInt(min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/**
 * Pure config helper: one lateral stream per canvas row. Each stream starts at
 * a random column, moves at a random speed inside [speedMin, speedMax], and
 * carries a trail length inside the bounded range. Row/col cell counts are
 * derived from the canvas size by the caller.
 */
export function buildLateralStreams(
  rows: number,
  cols: number,
  speedMin: number,
  speedMax: number,
): LateralStream[] {
  const streams: LateralStream[] = [];
  for (let i = 0; i < rows; i++) {
    streams.push({
      x: Math.floor(Math.random() * Math.max(cols, 1)),
      speed: randomInt(speedMin, speedMax),
      len: randomInt(MIN_STREAM_LENGTH, MAX_STREAM_LENGTH),
    });
  }
  return streams;
}

function readCssVar(name: string, fallback: string): string {
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  } catch {
    return fallback;
  }
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(48, 209, 88, ${alpha})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function createMatrixStream(
  canvas: HTMLCanvasElement,
  opts: MatrixStreamOptions = {},
): MatrixStream {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { start() {}, stop() {} };
  }
  const canvasContext = ctx;

  const glyphs = opts.glyphs ?? DEFAULT_GLYPHS;
  const fontSize = opts.fontSize ?? DEFAULT_FONT_SIZE;
  const speedMin = opts.speedMin ?? DEFAULT_SPEED_MIN;
  const speedMax = opts.speedMax ?? DEFAULT_SPEED_MAX;
  const cellWidth = fontSize * 0.6;

  // Colors come from CSS variables so the hero adapts to html.dark.
  const headColor = readCssVar('--color-success', '#30d158');
  const trailColor = readCssVar('--color-on-dark', '#fdfcfc');

  let rafId: number | null = null;
  let streams: LateralStream[] = [];
  let width = 0;
  let height = 0;
  let lastTime = 0;

  function layout(): void {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = width;
    canvas.height = height;
    const rows = Math.max(1, Math.floor(height / fontSize));
    const cols = Math.max(1, Math.floor(width / cellWidth));
    streams = buildLateralStreams(rows, cols, speedMin, speedMax);
  }

  function pickGlyph(): string {
    return glyphs[Math.floor(Math.random() * glyphs.length)] ?? '0';
  }

  function frame(t: number): void {
    if (lastTime === 0) lastTime = t;
    const dt = Math.min(Math.max((t - lastTime) / 1000, 0), 0.1);
    lastTime = t;

    canvasContext.clearRect(0, 0, width, height);
    canvasContext.font = `${fontSize}px ui-monospace, "JetBrains Mono", monospace`;
    const cols = Math.max(1, Math.floor(width / cellWidth));

    streams.forEach((stream, row) => {
      stream.x += stream.speed * dt;
      const head = Math.floor(stream.x);
      if (head - stream.len > cols) {
        stream.x = -Math.floor(Math.random() * cols * 0.5);
        stream.speed = randomInt(speedMin, speedMax);
        stream.len = randomInt(MIN_STREAM_LENGTH, MAX_STREAM_LENGTH);
      }
      for (let i = 0; i < stream.len; i++) {
        const col = head - i;
        if (col < 0 || col >= cols) continue;
        const x = col * cellWidth;
        const y = (row + 1) * fontSize;
        if (i === 0) {
          canvasContext.fillStyle = rgba(headColor, 0.9);
        } else {
          canvasContext.fillStyle = rgba(trailColor, Math.max(0.08, 0.5 - i * 0.04));
        }
        canvasContext.fillText(pickGlyph(), x, y);
      }
    });

    rafId = requestAnimationFrame(frame);
  }

  function drawStaticGrid(): void {
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.font = `${fontSize}px ui-monospace, "JetBrains Mono", monospace`;
    const cols = Math.max(1, Math.floor(width / cellWidth));
    const rows = Math.max(1, Math.floor(height / fontSize));
    canvasContext.fillStyle = rgba(trailColor, 0.12);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        canvasContext.fillText(pickGlyph(), c * cellWidth, (r + 1) * fontSize);
      }
    }
  }

  function start(): void {
    if (rafId !== null) return;
    layout();
    if (prefersReducedMotion()) {
      drawStaticGrid();
      return;
    }
    lastTime = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return { start, stop };
}
