import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // mongodb-memory-server binary + mongoose need real timers and a bit of time.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});