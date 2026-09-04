import { describe, it, expect } from 'vitest';
import { createApp } from './app.js';
import type { AppConfig } from './config.js';

function cfg(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    jwtSecret: 'test-secret',
    accessTokenTtlSec: 900,
    refreshTokenTtlSec: 2592000,
    mongoUri: 'mongodb://127.0.0.1:27017/cms-test',
    corsOrigins: ['https://allowed.dev'],
    adminSeed: { email: 'admin@cms.local', password: 'change-me-now' },
    rateLimit: { windowMs: 15 * 60 * 1000, max: 10 },
    ...overrides,
  };
}

describe('app boot (task 1.1)', () => {
  it('serves health at GET /api/v1/health with a JSON ok payload', async () => {
    const res = await createApp({ config: cfg() }).request('/api/v1/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('answers 404 JSON for unknown /api/v1 routes', async () => {
    const res = await createApp({ config: cfg() }).request('/api/v1/nope');
    expect(res.status).toBe(404);
  });

  it('uses the /api/v1 basePath for the health route', async () => {
    const res = await createApp({ config: cfg() }).request('/health');
    expect(res.status).toBe(404);
  });
});

describe('CORS restriction (task 1.2)', () => {
  it('reflects the allowed origin in Access-Control-Allow-Origin', async () => {
    const res = await createApp({ config: cfg() }).request('/api/v1/health', {
      headers: { Origin: 'https://allowed.dev' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('https://allowed.dev');
  });

  it('emits no CORS headers for a disallowed origin', async () => {
    const res = await createApp({ config: cfg() }).request('/api/v1/health', {
      headers: { Origin: 'https://evil.dev' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});