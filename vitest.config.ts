import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default defineConfig(async ({ mode }) => {
  const astroConfig = await getViteConfig({ mode });
  return {
    ...astroConfig,
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
      environment: 'node',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  };
});
