import { getViteConfig } from 'astro/config';
import type { UserConfig } from 'vite';

export default getViteConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
} as UserConfig);