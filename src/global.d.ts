declare module 'aos';

interface Window {
  __AOS: { init(options?: Record<string, unknown>): void };
  __typewriterDone: boolean;
  __heroFadeHandler: ((ev: Event) => void) | null;
  __homeMotion: { stops: Array<{ stop(): void }>; anims: Array<{ stop(): void }> } | null;
  __heroMatrix: { start(): void; stop(): void } | null;
  __heroCursorDispose: (() => void) | null;
}